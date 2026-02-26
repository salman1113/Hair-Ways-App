import os
from io import BytesIO
from django.conf import settings
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_daily_report_pdf(report_data):
    """
    Generates a PDF using reportlab.
    Returns: BytesIO object containing the PDF data
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    title_style.alignment = 1 # Center
    
    subtitle_style = styles['Heading2']
    normal_style = styles['Normal']

    # --- Header ---
    elements.append(Paragraph(f"Hair Ways Salon - Daily Performance Report", title_style))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(f"Date: {report_data['date']}", normal_style))
    elements.append(Spacer(1, 24))

    # --- Summary Metrics ---
    elements.append(Paragraph("System Summary", subtitle_style))
    summary_data = [
        ["Total Revenue", f"Rs. {report_data['total_revenue']}"],
        ["Total Bookings", str(report_data['total_bookings'])],
        ["Completed Bookings", str(report_data['completed_bookings'])],
        ["Cancelled/No-Shows", str(report_data['cancelled_bookings'])],
    ]
    
    # Table Stylings
    t = Table(summary_data, colWidths=[150, 150])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#f5f5f5')),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.black),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#dddddd'))
    ]))
    elements.append(t)
    elements.append(Spacer(1, 24))

    # --- Employee Performance Array ---
    elements.append(Paragraph("Employee Performance Breakdown", subtitle_style))
    emp_data = [["Employee Name", "Jobs Completed", "Revenue Generated"]]
    
    for emp in report_data['employee_performance']:
        emp_data.append([
            emp['name'], 
            str(emp['completed_jobs']), 
            f"Rs. {emp['revenue_generated']}"
        ])
        
    if len(emp_data) > 1:
        t_emp = Table(emp_data, colWidths=[150, 120, 150])
        t_emp.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1a1a1a')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#c19d6c')),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#dddddd'))
        ]))
        elements.append(t_emp)
    else:
         elements.append(Paragraph("No employee data for today.", normal_style))

    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer
