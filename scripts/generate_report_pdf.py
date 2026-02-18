#!/usr/bin/env python3
"""
SGS - SPGE Groundcheck System PDF Report Generator
Generates professional PDF reports for Ground Check tasks
"""

import json
import sys
import os
import base64
import tempfile
from datetime import datetime
from io import BytesIO

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle,
    PageBreak, KeepTogether
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# Register fonts
FONT_PATHS = {
    'SimHei': '/usr/share/fonts/truetype/chinese/SimHei.ttf',
    'Microsoft YaHei': '/usr/share/fonts/truetype/chinese/msyh.ttf',
    'Times New Roman': '/usr/share/fonts/truetype/english/Times-New-Roman.ttf',
}

# Try to register fonts, use defaults if not available
for font_name, font_path in FONT_PATHS.items():
    try:
        if os.path.exists(font_path):
            pdfmetrics.registerFont(TTFont(font_name, font_path))
    except Exception as e:
        print(f"Warning: Could not register font {font_name}: {e}", file=sys.stderr)

# Try to register font families for bold support
try:
    registerFontFamily('SimHei', normal='SimHei', bold='SimHei')
    registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')
except Exception:
    pass

# Orange theme colors
ORANGE_PRIMARY = colors.HexColor('#EA580C')
ORANGE_LIGHT = colors.HexColor('#FED7AA')
ORANGE_DARK = colors.HexColor('#C2410C')
GRAY_LIGHT = colors.HexColor('#F5F5F5')
GRAY_DARK = colors.HexColor('#333333')


def create_styles():
    """Create custom paragraph styles for the PDF"""
    styles = getSampleStyleSheet()
    
    # Title style
    styles.add(ParagraphStyle(
        name='MainTitle',
        fontName='SimHei' if 'SimHei' in pdfmetrics.getRegisteredFontNames() else 'Helvetica-Bold',
        fontSize=24,
        textColor=ORANGE_PRIMARY,
        alignment=TA_CENTER,
        spaceAfter=6,
    ))
    
    # Subtitle style
    styles.add(ParagraphStyle(
        name='SubTitle',
        fontName='SimHei' if 'SimHei' in pdfmetrics.getRegisteredFontNames() else 'Helvetica',
        fontSize=14,
        textColor=GRAY_DARK,
        alignment=TA_CENTER,
        spaceAfter=20,
    ))
    
    # Section header style
    styles.add(ParagraphStyle(
        name='SectionHeader',
        fontName='SimHei' if 'SimHei' in pdfmetrics.getRegisteredFontNames() else 'Helvetica-Bold',
        fontSize=14,
        textColor=ORANGE_DARK,
        alignment=TA_LEFT,
        spaceBefore=12,
        spaceAfter=8,
    ))
    
    # Body text style
    styles.add(ParagraphStyle(
        name='BodyText',
        fontName='SimHei' if 'SimHei' in pdfmetrics.getRegisteredFontNames() else 'Helvetica',
        fontSize=10,
        textColor=GRAY_DARK,
        alignment=TA_LEFT,
        spaceBefore=4,
        spaceAfter=4,
        wordWrap='CJK',
    ))
    
    # Table cell style
    styles.add(ParagraphStyle(
        name='TableCell',
        fontName='SimHei' if 'SimHei' in pdfmetrics.getRegisteredFontNames() else 'Helvetica',
        fontSize=9,
        textColor=GRAY_DARK,
        alignment=TA_CENTER,
        wordWrap='CJK',
    ))
    
    # Table header style
    styles.add(ParagraphStyle(
        name='TableHeader',
        fontName='SimHei' if 'SimHei' in pdfmetrics.getRegisteredFontNames() else 'Helvetica-Bold',
        fontSize=10,
        textColor=colors.white,
        alignment=TA_CENTER,
    ))
    
    # Caption style
    styles.add(ParagraphStyle(
        name='Caption',
        fontName='SimHei' if 'SimHei' in pdfmetrics.getRegisteredFontNames() else 'Helvetica',
        fontSize=9,
        textColor=GRAY_DARK,
        alignment=TA_CENTER,
        spaceBefore=4,
        spaceAfter=12,
    ))
    
    # Footer style
    styles.add(ParagraphStyle(
        name='Footer',
        fontName='SimHei' if 'SimHei' in pdfmetrics.getRegisteredFontNames() else 'Helvetica',
        fontSize=8,
        textColor=colors.gray,
        alignment=TA_CENTER,
    ))
    
    return styles


def decode_base64_image(base64_data):
    """Decode base64 image data and return image bytes"""
    try:
        # Remove data URL prefix if present
        if ',' in base64_data:
            base64_data = base64_data.split(',')[1]
        
        image_bytes = base64.b64decode(base64_data)
        return image_bytes
    except Exception as e:
        print(f"Error decoding image: {e}", file=sys.stderr)
        return None


def create_header_logo():
    """Create a simple palm tree logo using a colored circle"""
    # Return None for now - we'll use text-based header
    return None


def generate_pdf(task_data, output_path):
    """Generate the PDF report from task data"""
    
    # Create document
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm,
        title=f"GroundCheck_{task_data.get('divisionCode', '')}_{task_data.get('foremanCode', '')}",
        author='Z.ai',
        creator='Z.ai',
        subject='Laporan Ground Check - SPGE Groundcheck System'
    )
    
    styles = create_styles()
    story = []
    
    # Header Section
    story.append(Spacer(1, 20))
    story.append(Paragraph("SGS", styles['MainTitle']))
    story.append(Paragraph("SPGE Groundcheck System", styles['SubTitle']))
    story.append(Paragraph("Laporan Ground Check - QC Buah", styles['SubTitle']))
    story.append(Spacer(1, 30))
    
    # Info Table
    created_date = task_data.get('createdAt', '')
    if created_date:
        try:
            dt = datetime.fromisoformat(created_date.replace('Z', '+00:00'))
            formatted_date = dt.strftime('%d %B %Y, %H:%M')
        except:
            formatted_date = created_date
    else:
        formatted_date = datetime.now().strftime('%d %B %Y, %H:%M')
    
    info_data = [
        [Paragraph('<b>Tanggal</b>', styles['BodyText']), 
         Paragraph(formatted_date, styles['BodyText'])],
        [Paragraph('<b>Nama Krani</b>', styles['BodyText']), 
         Paragraph(task_data.get('clerkName', '-'), styles['BodyText'])],
        [Paragraph('<b>Divisi</b>', styles['BodyText']), 
         Paragraph(f"Divisi {task_data.get('divisionCode', '-')}", styles['BodyText'])],
        [Paragraph('<b>Kemandoran</b>', styles['BodyText']), 
         Paragraph(f"Kemandoran {task_data.get('foremanCode', '-')}", styles['BodyText'])],
    ]
    
    info_table = Table(info_data, colWidths=[4*cm, 10*cm])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), ORANGE_LIGHT),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 20))
    
    # TPH Photos Section
    story.append(Paragraph("Dokumentasi TPH", styles['SectionHeader']))
    
    attachments = task_data.get('attachments', [])
    if attachments:
        # Create a grid of photos (2 per row)
        photo_rows = []
        for i in range(0, len(attachments), 2):
            row = []
            for j in range(2):
                if i + j < len(attachments):
                    att = attachments[i + j]
                    photo_data = att.get('photoData', '')
                    tph_num = att.get('tphNumber', i + j + 1)
                    
                    if photo_data:
                        try:
                            image_bytes = decode_base64_image(photo_data)
                            if image_bytes:
                                # Save to temp file
                                with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as f:
                                    f.write(image_bytes)
                                    temp_path = f.name
                                
                                # Create image
                                img = Image(temp_path, width=6*cm, height=6*cm)
                                
                                # Create cell with image and label
                                cell_content = [
                                    img,
                                    Spacer(1, 4),
                                    Paragraph(f"<b>TPH {tph_num}</b>", styles['Caption'])
                                ]
                                row.append(cell_content)
                                
                                # Clean up temp file
                                try:
                                    os.unlink(temp_path)
                                except:
                                    pass
                            else:
                                row.append(Paragraph(f"TPH {tph_num} - Gagal memuat", styles['BodyText']))
                        except Exception as e:
                            row.append(Paragraph(f"TPH {tph_num} - Error", styles['BodyText']))
                    else:
                        row.append(Paragraph(f"TPH {tph_num} - Tidak ada foto", styles['BodyText']))
                else:
                    row.append('')
            
            photo_rows.append(row)
        
        if photo_rows:
            photo_table = Table(photo_rows, colWidths=[8*cm, 8*cm])
            photo_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ]))
            story.append(photo_table)
    else:
        story.append(Paragraph("Tidak ada dokumentasi TPH", styles['BodyText']))
    
    story.append(Spacer(1, 20))
    
    # Notes Section
    notes = task_data.get('notes', '')
    if notes:
        story.append(Paragraph("Catatan (NB) - Nama Pemanen Buah Mentah", styles['SectionHeader']))
        story.append(Paragraph(notes, styles['BodyText']))
        story.append(Spacer(1, 20))
    
    # Signature Section
    signature_data = task_data.get('signature', '')
    if signature_data:
        story.append(Spacer(1, 30))
        story.append(Paragraph("Tanda Tangan Digital", styles['SectionHeader']))
        
        try:
            sig_bytes = decode_base64_image(signature_data)
            if sig_bytes:
                with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
                    f.write(sig_bytes)
                    temp_sig_path = f.name
                
                sig_img = Image(temp_sig_path, width=6*cm, height=3*cm)
                
                sig_data = [
                    [sig_img],
                    [Paragraph("_" * 30, styles['Caption'])],
                    [Paragraph(f"<b>{task_data.get('clerkName', 'Krani')}</b>", styles['Caption'])],
                ]
                
                sig_table = Table(sig_data, colWidths=[8*cm])
                sig_table.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ]))
                story.append(sig_table)
                
                try:
                    os.unlink(temp_sig_path)
                except:
                    pass
        except Exception as e:
            print(f"Error adding signature: {e}", file=sys.stderr)
    
    # Footer
    story.append(Spacer(1, 40))
    story.append(Paragraph("_" * 60, styles['Footer']))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        f"Dibuat secara digital melalui SGS - SPGE Groundcheck System",
        styles['Footer']
    ))
    story.append(Paragraph(
        f"© {datetime.now().year()} SPGE",
        styles['Footer']
    ))
    
    # Build PDF
    doc.build(story)
    print(f"PDF generated successfully: {output_path}")


def main():
    if len(sys.argv) != 3:
        print("Usage: python generate_report_pdf.py <input_json> <output_pdf>", file=sys.stderr)
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            task_data = json.load(f)
        
        generate_pdf(task_data, output_path)
        sys.exit(0)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
