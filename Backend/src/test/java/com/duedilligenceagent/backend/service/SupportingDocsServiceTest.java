package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.entities.SupportingDocs;
import com.duedilligenceagent.backend.exception.InvalidAuthRequestException;
import com.duedilligenceagent.backend.repositories.DueDiligenceReportRepository;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import com.duedilligenceagent.backend.repositories.SupportingDocsRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

/**
 * Verifies the supporting-document upload guards: empty files, oversize
 * files, unsupported types and exact duplicates are rejected with a
 * clear message; valid evidence files pass.
 */
@ExtendWith(MockitoExtension.class)
class SupportingDocsServiceTest {

    private static final Long PROPERTY_ID = 1004L;

    @Mock private SupportingDocsRepository supportingDocsRepository;
    @Mock private PropertyRepository propertyRepository;
    @Mock private DueDiligenceReportRepository reportRepository;

    @InjectMocks private SupportingDocsService service;

    private void stubExistingFiles(String... names) {
        lenient().when(supportingDocsRepository.findByPropertyIdOrderByUploadedAtDesc(PROPERTY_ID))
                .thenReturn(java.util.Arrays.stream(names)
                        .map(n -> SupportingDocs.builder()
                                .documentId(1L).propertyId(PROPERTY_ID).fileName(n)
                                .build())
                        .toList());
    }

    @Test
    void rejectsEmptyFile() {
        MockMultipartFile empty = new MockMultipartFile(
                "file", "sale-deed.pdf", "application/pdf", new byte[0]);

        assertThatThrownBy(() -> service.validateUpload(empty, PROPERTY_ID))
                .isInstanceOf(InvalidAuthRequestException.class)
                .hasMessageContaining("Select a file");
    }

    @Test
    void rejectsOversizeFile() {
        byte[] big = new byte[(int) (SupportingDocsService.MAX_FILE_SIZE_BYTES + 1)];
        MockMultipartFile oversize = new MockMultipartFile(
                "file", "sale-deed.pdf", "application/pdf", big);

        assertThatThrownBy(() -> service.validateUpload(oversize, PROPERTY_ID))
                .isInstanceOf(InvalidAuthRequestException.class)
                .hasMessageContaining("too large")
                .hasMessageContaining("10 MB");
    }

    @ParameterizedTest
    @ValueSource(strings = {"malware.exe", "script.sh", "archive.zip", "no-extension"})
    void rejectsUnsupportedFileTypes(String fileName) {
        MockMultipartFile file = new MockMultipartFile(
                "file", fileName, "application/octet-stream", new byte[]{1, 2, 3});

        assertThatThrownBy(() -> service.validateUpload(file, PROPERTY_ID))
                .isInstanceOf(InvalidAuthRequestException.class)
                .hasMessageContaining("Unsupported file type");
    }

    @Test
    void rejectsDuplicateFileNameForTheSameProperty() {
        stubExistingFiles("Sale-Deed.pdf");
        MockMultipartFile duplicate = new MockMultipartFile(
                "file", "sale-deed.pdf", "application/pdf", new byte[]{1, 2, 3});

        assertThatThrownBy(() -> service.validateUpload(duplicate, PROPERTY_ID))
                .isInstanceOf(InvalidAuthRequestException.class)
                .hasMessageContaining("already been uploaded");
    }

    @Test
    void duplicateCheckIsCaseAndWhitespaceInsensitive() {
        stubExistingFiles("  sale deed.PDF  ");
        MockMultipartFile duplicate = new MockMultipartFile(
                "file", "Sale Deed.pdf", "application/pdf", new byte[]{1, 2, 3});

        assertThatThrownBy(() -> service.validateUpload(duplicate, PROPERTY_ID))
                .isInstanceOf(InvalidAuthRequestException.class)
                .hasMessageContaining("already been uploaded");
    }

    @Test
    void acceptsValidEvidenceFile() {
        stubExistingFiles("other-document.pdf");
        MockMultipartFile valid = new MockMultipartFile(
                "file", "Sale-Deed.pdf", "application/pdf", new byte[]{1, 2, 3});

        assertThatCode(() -> service.validateUpload(valid, PROPERTY_ID))
                .doesNotThrowAnyException();
    }

    @ParameterizedTest
    @ValueSource(strings = {"deed.pdf", "photo.jpg", "photo.jpeg", "plan.png",
            "notes.doc", "notes.docx", "sheet.xls", "sheet.xlsx", "data.csv", "readme.txt"})
    void acceptsAllAllowedExtensions(String fileName) {
        stubExistingFiles();
        MockMultipartFile file = new MockMultipartFile(
                "file", fileName, "application/octet-stream", new byte[]{1, 2, 3});

        assertThatCode(() -> service.validateUpload(file, PROPERTY_ID))
                .doesNotThrowAnyException();
    }

    @Test
    void sameFileNameIsAllowedAcrossDifferentProperties() {
        // The duplicate check is scoped to the target property: 1004 has
        // no files, so the same file name stored on another property
        // (1001) does not block this upload.
        when(supportingDocsRepository.findByPropertyIdOrderByUploadedAtDesc(PROPERTY_ID))
                .thenReturn(List.of());
        MockMultipartFile file = new MockMultipartFile(
                "file", "Sale-Deed.pdf", "application/pdf", new byte[]{1, 2, 3});

        assertThatCode(() -> service.validateUpload(file, PROPERTY_ID))
                .doesNotThrowAnyException();
    }
}
