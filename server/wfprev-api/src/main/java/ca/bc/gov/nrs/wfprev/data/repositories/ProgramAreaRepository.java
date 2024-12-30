package ca.bc.gov.nrs.wfprev.data.repositories;

import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import ca.bc.gov.nrs.wfprev.common.repository.CommonRepository;
import ca.bc.gov.nrs.wfprev.data.entities.ProgramAreaEntity;

import java.util.UUID;

@RepositoryRestResource(exported = false)
public interface ProgramAreaRepository extends CommonRepository<ProgramAreaEntity, UUID> {
  
}