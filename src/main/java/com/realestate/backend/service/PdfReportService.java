package com.realestate.backend.service;

import java.io.ByteArrayInputStream;

public interface PdfReportService {
    ByteArrayInputStream generatePropertyPdf(Long propertyId);
}
