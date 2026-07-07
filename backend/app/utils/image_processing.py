import cv2
import numpy as np
from PIL import Image
import os

def check_image_blur(image_path: str) -> float:
    """
    Computes the Laplacian variance of the image.
    Low variance (< 100.0) generally indicates blurriness.
    """
    if not os.path.exists(image_path):
        return 0.0
    image = cv2.imread(image_path)
    if image is None:
        return 0.0
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    fm = cv2.Laplacian(gray, cv2.CV_64F).var()
    return float(fm)

def check_image_brightness(image_path: str) -> float:
    """
    Computes average pixel intensity (0 to 255) of the image.
    Extreme values indicate over/underexposed images.
    """
    if not os.path.exists(image_path):
        return 0.0
    image = cv2.imread(image_path)
    if image is None:
        return 0.0
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    mean = cv2.mean(gray)[0]
    return float(mean)

def crop_detected_tooth(image_path: str, bbox: list, output_path: str, padding: int = 10) -> bool:
    """
    Crops the image given a bounding box: [x, y, w, h] or [ymin, xmin, ymax, xmax].
    Saves the cropped region to output_path.
    """
    if not os.path.exists(image_path):
        return False
    image = cv2.imread(image_path)
    if image is None:
        return False
    
    height, width = image.shape[:2]
    
    # If bbox is [x, y, w, h]
    x, y, w, h = bbox
    
    # Apply padding
    x_start = max(0, x - padding)
    y_start = max(0, y - padding)
    x_end = min(width, x + w + padding)
    y_end = min(height, y + h + padding)
    
    cropped = image[y_start:y_end, x_start:x_end]
    if cropped.size == 0:
        return False
        
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    cv2.imwrite(output_path, cropped)
    return True
