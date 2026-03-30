package com.bukukasir.filestorage.infrastructure.persistence.repository;

import com.bukukasir.filestorage.infrastructure.persistence.entity.FileMetadataEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaFileRepository extends JpaRepository<FileMetadataEntity, String> {

    List<FileMetadataEntity> findByBusinessId(String businessId);

    List<FileMetadataEntity> findByEntityId(String entityId);

    List<FileMetadataEntity> findByBusinessIdAndFileType(String businessId, String fileType);
}
