package com.realestate.backend.Service;

import java.io.ByteArrayOutputStream;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import com.realestate.backend.Entity.DueDiligenceReport;

@Service
public class ExcelReportService {

    public byte[] generateExcel(DueDiligenceReport report) throws Exception {

        Workbook workbook = new XSSFWorkbook();

        Sheet sheet = workbook.createSheet("Due Diligence Report");

        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("Field");
        header.createCell(1).setCellValue("Value");

        Row row1 = sheet.createRow(1);
        row1.createCell(0).setCellValue("Property ID");
        row1.createCell(1).setCellValue(report.getPropertyId());

        Row row2 = sheet.createRow(2);
        row2.createCell(0).setCellValue("Property Address");
        row2.createCell(1).setCellValue(report.getPropertyAddress());

        Row row3 = sheet.createRow(3);
        row3.createCell(0).setCellValue("Risk Score");
        row3.createCell(1).setCellValue(report.getRiskScore());

        Row row4 = sheet.createRow(4);
        row4.createCell(0).setCellValue("Overall Risk");
        row4.createCell(1).setCellValue(report.getOverallRisk());

        Row row5 = sheet.createRow(5);
        row5.createCell(0).setCellValue("Executive Summary");
        row5.createCell(1).setCellValue(report.getExecutiveSummary());

        Row row6 = sheet.createRow(6);
        row6.createCell(0).setCellValue("Property Timeline");
        row6.createCell(1).setCellValue(report.getPropertyTimeline());

        Row row7 = sheet.createRow(7);
        row7.createCell(0).setCellValue("Supporting Documents");
        row7.createCell(1).setCellValue(report.getSupportingDocuments());

        Row row8 = sheet.createRow(8);
        row8.createCell(0).setCellValue("Generated At");
        row8.createCell(1).setCellValue(
                report.getGeneratedAt().toString());

        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);

        ByteArrayOutputStream outputStream =
                new ByteArrayOutputStream();

        workbook.write(outputStream);
        workbook.close();

        return outputStream.toByteArray();
    }
}