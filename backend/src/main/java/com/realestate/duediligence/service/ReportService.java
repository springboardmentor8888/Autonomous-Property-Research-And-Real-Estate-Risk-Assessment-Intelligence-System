package com.realestate.duediligence.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.realestate.duediligence.dto.PropertyDetailsResponse;
import com.realestate.duediligence.dto.RiskAssessmentResponse;
import com.realestate.duediligence.entity.OwnershipRecord;
import com.realestate.duediligence.entity.PermitRecord;
import com.realestate.duediligence.entity.TaxHistory;

/**
 * Generates downloadable due-diligence reports (PDF and Excel) from a
 * property's existing details and risk assessment data.
 */
@Service
public class ReportService {

	public byte[] generatePdfReport(PropertyDetailsResponse details, RiskAssessmentResponse risk) {

		try {
			ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
			Document document = new Document();
			PdfWriter.getInstance(document, outputStream);
			document.open();

			Font titleFont = new Font(Font.HELVETICA, 20, Font.BOLD);
			Font headingFont = new Font(Font.HELVETICA, 14, Font.BOLD);
			Font normalFont = new Font(Font.HELVETICA, 11, Font.NORMAL);

			document.add(new Paragraph("Real Estate Due Diligence Report", titleFont));
			document.add(new Paragraph(" "));

			document.add(new Paragraph("Executive Summary", headingFont));
			document.add(new Paragraph("Property: " + details.getAddress(), normalFont));
			document.add(new Paragraph("Property ID: " + details.getId(), normalFont));
			document.add(new Paragraph(" "));

			document.add(new Paragraph("Risk Assessment", headingFont));
			document.add(new Paragraph("Overall Risk Level: " + risk.getOverallRiskLevel(), normalFont));
			document.add(new Paragraph("Risk Score: " + risk.getRiskScore() + " / 100", normalFont));
			document.add(new Paragraph("Tax: " + risk.getTaxRiskNote(), normalFont));
			document.add(new Paragraph("Flood: " + risk.getFloodRiskNote(), normalFont));
			document.add(new Paragraph("Zoning: " + risk.getZoningRiskNote(), normalFont));
			document.add(new Paragraph("Permits: " + risk.getPermitRiskNote(), normalFont));
			document.add(new Paragraph("Environmental: " + risk.getEnvironmentalRiskNote(), normalFont));
			document.add(new Paragraph(" "));

			document.add(new Paragraph("Ownership Timeline", headingFont));
			for (OwnershipRecord owner : details.getOwnershipHistory()) {
				String period = owner.getTransferDate() != null
						? owner.getAcquiredDate() + " to " + owner.getTransferDate()
						: owner.getAcquiredDate() + " to present";
				document.add(new Paragraph(owner.getOwnerName() + " (" + period + ")", normalFont));
			}
			document.add(new Paragraph(" "));

			document.add(new Paragraph("Tax History", headingFont));
			for (TaxHistory tax : details.getTaxHistory()) {
				document.add(new Paragraph(tax.getYear() + ": " + tax.getAmountPaid() + " (" + tax.getStatus() + ")",
						normalFont));
			}
			document.add(new Paragraph(" "));

			document.add(new Paragraph("Permit Records", headingFont));
			for (PermitRecord permit : details.getPermits()) {
				document.add(new Paragraph(permit.getPermitType() + " - " + permit.getStatus() + " (issued "
						+ permit.getIssuedDate() + ")", normalFont));
			}

			document.close();
			return outputStream.toByteArray();

		} catch (DocumentException e) {
			throw new RuntimeException("Failed to generate PDF report", e);
		}
	}

	/**
	 * Builds an Excel workbook with separate sheets for Summary, Tax History,
	 * Permits, and Ownership — better suited than PDF for tabular data a buyer
	 * might want to sort or filter.
	 */
	public byte[] generateExcelReport(PropertyDetailsResponse details, RiskAssessmentResponse risk) {

		try (Workbook workbook = new XSSFWorkbook()) {

			// ----- Summary sheet -----
			Sheet summarySheet = workbook.createSheet("Summary");
			int rowNum = 0;

			Row titleRow = summarySheet.createRow(rowNum++);
			titleRow.createCell(0).setCellValue("Real Estate Due Diligence Report");

			summarySheet.createRow(rowNum++);

			addRow(summarySheet, rowNum++, "Property", details.getAddress());
			addRow(summarySheet, rowNum++, "Property ID", String.valueOf(details.getId()));
			addRow(summarySheet, rowNum++, "Overall Risk Level", risk.getOverallRiskLevel().toString());
			addRow(summarySheet, rowNum++, "Risk Score", risk.getRiskScore() + " / 100");
			addRow(summarySheet, rowNum++, "Tax Note", risk.getTaxRiskNote());
			addRow(summarySheet, rowNum++, "Flood Note", risk.getFloodRiskNote());
			addRow(summarySheet, rowNum++, "Zoning Note", risk.getZoningRiskNote());
			addRow(summarySheet, rowNum++, "Permit Note", risk.getPermitRiskNote());
			addRow(summarySheet, rowNum++, "Environmental Note", risk.getEnvironmentalRiskNote());

			// ----- Tax History sheet -----
			Sheet taxSheet = workbook.createSheet("Tax History");
			Row taxHeader = taxSheet.createRow(0);
			taxHeader.createCell(0).setCellValue("Year");
			taxHeader.createCell(1).setCellValue("Amount Paid");
			taxHeader.createCell(2).setCellValue("Status");

			int taxRow = 1;
			for (TaxHistory tax : details.getTaxHistory()) {
				Row row = taxSheet.createRow(taxRow++);
				row.createCell(0).setCellValue(tax.getYear());
				row.createCell(1).setCellValue(tax.getAmountPaid().doubleValue());
				row.createCell(2).setCellValue(tax.getStatus().toString());
			}

			// ----- Permits sheet -----
			Sheet permitSheet = workbook.createSheet("Permits");
			Row permitHeader = permitSheet.createRow(0);
			permitHeader.createCell(0).setCellValue("Permit Type");
			permitHeader.createCell(1).setCellValue("Status");
			permitHeader.createCell(2).setCellValue("Issued Date");

			int permitRow = 1;
			for (PermitRecord permit : details.getPermits()) {
				Row row = permitSheet.createRow(permitRow++);
				row.createCell(0).setCellValue(permit.getPermitType());
				row.createCell(1).setCellValue(permit.getStatus().toString());
				row.createCell(2).setCellValue(permit.getIssuedDate().toString());
			}

			// ----- Ownership sheet -----
			Sheet ownershipSheet = workbook.createSheet("Ownership");
			Row ownershipHeader = ownershipSheet.createRow(0);
			ownershipHeader.createCell(0).setCellValue("Owner Name");
			ownershipHeader.createCell(1).setCellValue("Acquired Date");
			ownershipHeader.createCell(2).setCellValue("Transfer Date");

			int ownershipRow = 1;
			for (OwnershipRecord owner : details.getOwnershipHistory()) {
				Row row = ownershipSheet.createRow(ownershipRow++);
				row.createCell(0).setCellValue(owner.getOwnerName());
				row.createCell(1).setCellValue(owner.getAcquiredDate().toString());
				row.createCell(2).setCellValue(
						owner.getTransferDate() != null ? owner.getTransferDate().toString() : "Current owner");
			}

			ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
			workbook.write(outputStream);
			return outputStream.toByteArray();

		} catch (IOException e) {
			throw new RuntimeException("Failed to generate Excel report", e);
		}
	}

	private void addRow(Sheet sheet, int rowNum, String label, String value) {
		Row row = sheet.createRow(rowNum);
		row.createCell(0).setCellValue(label);
		row.createCell(1).setCellValue(value);
	}
}