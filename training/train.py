import os
import shutil
import argparse
import logging
import random
import numpy as np
import torch
from pathlib import Path

from google.cloud import storage
from ultralytics import YOLO

from config import (
    PROJECT_ID,
    DATASET_BUCKET,
    ARTIFACT_BUCKET,
    MODEL_NAME,
    DEFAULT_EPOCHS,
    DEFAULT_BATCH,
    DEFAULT_IMGSZ,
    DEFAULT_OPTIMIZER,
    DEFAULT_COS_LR,
    DEFAULT_RESUME,
    DEFAULT_CLOSE_MOSAIC,
    DEFAULT_AUGMENT,
    DEFAULT_WEIGHT_DECAY,
    DEFAULT_WARMUP_EPOCHS,
    DEFAULT_DROPOUT,
    DEFAULT_LRF,
    DEFAULT_MOMENTUM
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(message)s"
)

random.seed(42)
np.random.seed(42)
torch.manual_seed(42)
torch.cuda.manual_seed_all(42)

DATASET_PREFIX = "dentex-seg"

LOCAL_DATASET = Path("dataset")

RUNS_DIR = Path("runs")


def download_dataset():

    logging.info("Downloading Dataset From GCS")

    client = storage.Client()
    bucket = client.bucket(DATASET_BUCKET)

    if LOCAL_DATASET.exists():
        shutil.rmtree(LOCAL_DATASET)

    LOCAL_DATASET.mkdir(
        parents=True,
        exist_ok=True
    )

    blobs = client.list_blobs(
        DATASET_BUCKET,
        prefix=DATASET_PREFIX
    )

    total = 0
    for blob in blobs:
        if blob.name.endswith("/"):
            continue

        relative_path = blob.name[len(DATASET_PREFIX):].lstrip("/")
        destination = LOCAL_DATASET / relative_path

        destination.parent.mkdir(
            parents=True,
            exist_ok=True
        )

        blob.download_to_filename(
            str(destination)
        )
        total += 1

    if total == 0:
        raise RuntimeError("No files downloaded from bucket.")

    logging.info(f"Downloaded {total} files")


def verify_dataset():

    yaml_file = LOCAL_DATASET / "data.yaml"

    if not yaml_file.exists():
        raise FileNotFoundError(
            f"{yaml_file} not found"
        )

    logging.info("Dataset Verified")
    logging.info(yaml_file)


def get_args():

    parser = argparse.ArgumentParser()

    parser.add_argument("--model", type=str, default=MODEL_NAME)
    parser.add_argument("--epochs", type=int, default=DEFAULT_EPOCHS)
    parser.add_argument("--batch", type=int, default=DEFAULT_BATCH)
    parser.add_argument("--imgsz", type=int, default=DEFAULT_IMGSZ)
    parser.add_argument("--lr0", type=float, default=0.001)
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--patience", type=int, default=20)
    parser.add_argument("--project", type=str, default=str(RUNS_DIR))
    parser.add_argument("--name", type=str, default="dentex-yolov8m-seg")

    parser.add_argument("--optimizer", type=str, default=DEFAULT_OPTIMIZER)
    parser.add_argument("--cos_lr", action="store_true")
    parser.add_argument("--resume", action="store_true")
    parser.add_argument("--close_mosaic", type=int, default=DEFAULT_CLOSE_MOSAIC)
    parser.add_argument("--augment", action="store_true")
    parser.add_argument("--weight_decay", type=float, default=DEFAULT_WEIGHT_DECAY)
    parser.add_argument("--warmup_epochs", type=float, default=DEFAULT_WARMUP_EPOCHS)
    parser.add_argument("--dropout", type=float, default=DEFAULT_DROPOUT)
    parser.add_argument("--lrf", type=float, default=DEFAULT_LRF)
    parser.add_argument("--momentum", type=float, default=DEFAULT_MOMENTUM)

    parser.add_argument("--predict", action="store_true")
    parser.add_argument("--save", action="store_true")
    parser.add_argument("--save_period", type=int, default=-1)
    parser.add_argument("--cache", action="store_true")
    parser.add_argument("--amp", action="store_true")
    parser.add_argument("--plots", action="store_true")
    parser.add_argument("--val", action="store_true")

    return parser.parse_args()


def check_gpu():

    logging.info("GPU INFORMATION")
    logging.info(f"CUDA Available : {torch.cuda.is_available()}")

    if torch.cuda.is_available():
        logging.info(f"GPU : {torch.cuda.get_device_name(0)}")
        return 0

    logging.info("GPU Not Found")
    raise RuntimeError("GPU not found.")


def train_model(args, device):

    logging.info("Loading YOLO Model")

    model = YOLO(args.model)

    logging.info("Training Started")

    results = model.train(
        data=str(LOCAL_DATASET / "data.yaml"),
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        lr0=args.lr0,
        workers=args.workers,
        patience=args.patience,
        device=device,
        project=args.project,
        name=args.name,
        optimizer=args.optimizer,
        cos_lr=args.cos_lr,
        resume=args.resume,
        close_mosaic=args.close_mosaic,
        augment=args.augment,
        weight_decay=args.weight_decay,
        warmup_epochs=args.warmup_epochs,
        dropout=args.dropout,
        lrf=args.lrf,
        momentum=args.momentum,
        save=args.save,
        save_period=args.save_period,
        cache=args.cache,
        amp=args.amp,
        plots=args.plots,
        val=args.val,
        pretrained=True,
        exist_ok=True
    )

    return model, results


def validate_model(model):

    logging.info("Running Validation")

    metrics = model.val(
        data=str(LOCAL_DATASET / "data.yaml"),
        split="val"
    )
    logging.info("Validation completed.")

    return metrics


def run_prediction(model):

    test_folder = LOCAL_DATASET / "images" / "test"

    if not test_folder.exists():
        logging.info("Test folder not found. Skipping prediction.")
        return

    logging.info("Running Prediction")

    model.predict(
        source=str(test_folder),
        save=True,
        conf=0.25
    )


def upload_artifacts(args):

    logging.info("Uploading Artifacts")

    client = storage.Client()
    bucket = client.bucket(ARTIFACT_BUCKET)

    if not RUNS_DIR.exists():
        logging.info("Runs folder not found.")
        return

    total = 0

    for root, dirs, files in os.walk(RUNS_DIR):
        for file in files:
            local_file = os.path.join(root, file)
            blob_name = os.path.relpath(
                local_file,
                RUNS_DIR
            )
            blob = bucket.blob(
                f"experiments/{args.name}/{blob_name}"
            )
            blob.upload_from_filename(local_file)
            total += 1

    logging.info(f"{total} files uploaded.")


def main():

    logging.info("SmileGuard YOLOv8 Segmentation Training")
    logging.info(f"Project : {PROJECT_ID}")

    try:
        download_dataset()
        verify_dataset()
        args = get_args()
        device = check_gpu()
        model, results = train_model(args, device)
        validate_model(model)
        
        if args.predict:
            run_prediction(model)
            
        upload_artifacts(args)
        logging.info("Training Completed Successfully")
    except Exception as e:
        logging.info(e)
        raise


if __name__ == "__main__":
    main()