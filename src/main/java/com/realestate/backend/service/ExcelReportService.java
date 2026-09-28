package com.realestate.backend.service;

import java.io.ByteArrayInputStream;

public interface ExcelReportService {
    ByteArrayInputStream generatePropertyExcel(Long propertyId);
}
