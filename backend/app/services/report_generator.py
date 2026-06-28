import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from datetime import datetime

def generate_pdf_report(prediction_record, username: str, output_path: str) -> bool:
    """
    Generates a professional dental diagnostic PDF report.
    prediction_record: SQLAlchemy Prediction instance
    username: String username
    output_path: Target path to write PDF file
    """
    try:
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        doc = SimpleDocTemplate(
            output_path, 
            pagesize=letter,
            rightMargin=54, leftMargin=54, topMargin=54, bottomMargin=54
        )
        
        story = []
        styles = getSampleStyleSheet()
        
        # Define Custom Styles for a clean corporate medical look
        primary_color = colors.HexColor("#0284c7")  # Cyan/Blue
        dark_neutral = colors.HexColor("#1e293b")    # Dark slate
        
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=22,
            textColor=primary_color,
            spaceAfter=15
        )
        
        section_style = ParagraphStyle(
            'SectionTitle',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=14,
            textColor=dark_neutral,
            spaceBefore=12,
            spaceAfter=8,
            borderPadding=2
        )
        
        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#334155")
        )
        
        bold_body_style = ParagraphStyle(
            'BoldBody',
            parent=body_style,
            fontName='Helvetica-Bold'
        )
        
        disclaimer_style = ParagraphStyle(
            'Disclaimer',
            parent=styles['Italic'],
            fontName='Helvetica-Oblique',
            fontSize=8,
            leading=10,
            textColor=colors.HexColor("#64748b"),
            alignment=1 # Center
        )

        # 1. Header Section
        story.append(Paragraph("DENTEX - DENTAL DIAGNOSTIC REPORT", title_style))
        story.append(Paragraph("AI-Assisted Dental Disease Detection & Classification", body_style))
        story.append(Spacer(1, 10))
        
        # Horizontal line
        d_table = Table([[""]], colWidths=[500], rowHeights=[2])
        d_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), primary_color),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
            ('TOPPADDING', (0,0), (-1,-1), 0),
        ]))
        story.append(d_table)
        story.append(Spacer(1, 15))
        
        # 2. Patient & Report Metadata
        created_str = prediction_record.created_at.strftime("%Y-%m-%d %H:%M:%S")
        metadata_data = [
            [Paragraph("Patient Username:", bold_body_style), Paragraph(username, body_style),
             Paragraph("Report Date:", bold_body_style), Paragraph(created_str, body_style)],
            [Paragraph("Prediction ID:", bold_body_style), Paragraph(f"#{prediction_record.id}", body_style),
             Paragraph("Scan File Name:", bold_body_style), Paragraph(prediction_record.filename, body_style)]
        ]
        
        meta_table = Table(metadata_data, colWidths=[120, 130, 100, 150])
        meta_table.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 20))
        
        # 3. Primary Findings
        story.append(Paragraph("Diagnostic Summary", section_style))
        
        severity_color = "#10b981" # Green (Healthy)
        if prediction_record.severity == "Mild":
            severity_color = "#eab308" # Yellow
        elif prediction_record.severity == "Moderate":
            severity_color = "#f97316" # Orange
        elif prediction_record.severity == "Severe":
            severity_color = "#ef4444" # Red
            
        findings_data = [
            [Paragraph("Detected Condition:", bold_body_style), Paragraph(prediction_record.disease, body_style)],
            [Paragraph("Severity Grade:", bold_body_style), Paragraph(f"<font color='{severity_color}'><b>{prediction_record.severity}</b></font>", body_style)],
            [Paragraph("AI Confidence Score:", bold_body_style), Paragraph(f"{prediction_record.confidence}%", body_style)],
            [Paragraph("Image Clarity Check:", bold_body_style), Paragraph(f"Blur index: {prediction_record.blur_score:.2f} | Brightness: {prediction_record.brightness_score:.1f}", body_style)]
        ]
        
        findings_table = Table(findings_data, colWidths=[150, 350])
        findings_table.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
            ('PADDING', (0,0), (-1,-1), 10),
            ('LINEBELOW', (0,0), (-1,-1), 1, colors.HexColor("#f1f5f9")),
        ]))
        story.append(findings_table)
        story.append(Spacer(1, 20))
        
        # 4. Image Visuals
        story.append(Paragraph("Processed Dental Scan Reference", section_style))
        if os.path.exists(prediction_record.filepath):
            try:
                # Resize image proportionally to fit letter page width (~300px max height/width)
                img = Image(prediction_record.filepath)
                # Keep aspect ratio
                max_w = 4.0 * inch
                max_h = 3.0 * inch
                img.drawHeight = max_h
                img.drawWidth = max_w
                story.append(img)
            except Exception as img_err:
                story.append(Paragraph(f"Visual scan not renderable: {str(img_err)}", body_style))
        else:
            story.append(Paragraph("Image file not available on disk.", body_style))
            
        story.append(Spacer(1, 20))
        
        # 5. Treatment Recommendation
        story.append(Paragraph("Clinician Next Steps & Recommendation", section_style))
        rec_text = prediction_record.recommendation or "No recommendation provided."
        rec_box = Table([[Paragraph(rec_text, body_style)]], colWidths=[500])
        rec_box.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#eff6ff")),
            ('PADDING', (0,0), (-1,-1), 12),
            ('LINELEFT', (0,0), (-1,-1), 4, primary_color),
        ]))
        story.append(rec_box)
        story.append(Spacer(1, 40))
        
        # 6. Disclaimer Footer
        story.append(Paragraph("Disclaimer: This report was compiled by the Dentex AI engine as a supplementary guide. It is not an alternative to professional clinical examination. Final diagnosis and care plan must be approved by a registered dentist.", disclaimer_style))
        
        # Build PDF
        doc.build(story)
        return True
    except Exception as e:
        print(f"Error generating PDF report: {str(e)}")
        return False
