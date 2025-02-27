import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog , MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/components/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Messages } from 'src/app/utils/messages';
import { ProjectService } from 'src/app/services/project-services';
import { CodeTableServices } from 'src/app/services/code-table-services';
import { Project } from 'src/app/components/models';
@Component({
  selector: 'app-create-new-project-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './create-new-project-dialog.component.html',
  styleUrls: ['./create-new-project-dialog.component.scss']
})
export class CreateNewProjectDialogComponent implements OnInit {
  [key: string]: any; // Add this line to allow dynamic properties
  projectForm: FormGroup;
  messages = Messages;
  // Regions and sections mapping
  regionToSections: { [key: string]: string[] } = {
    'Northern': ['Omineca', 'Peace', 'Skeena'],
    'Thompson Cariboo': ['Cariboo', 'Thompson'],
    'Kootenay Okanagan': ['Kootenay', 'Okanagan'],
    'South Coast': ['South Coast'],
    'West Coast': ['Central Coast/North Island', 'Haida Gwaii/South Island']
  };

  businessAreas : any[] = [];
  forestRegions : any[] = [];
  forestDistricts : any[] = [];
  bcParksRegions : any[] = [];
  bcParksSections: any[] = [];
  allBcParksSections: any[] = []; // To hold all sections initially

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialog: MatDialog,
    private readonly dialogRef: MatDialogRef<CreateNewProjectDialogComponent>,
    private readonly snackbarService: MatSnackBar,
    private readonly projectService: ProjectService,
    private readonly codeTableService: CodeTableServices

  ) {
    this.projectForm = this.fb.group({
      projectName: ['', [Validators.required, Validators.maxLength(50)]],
      latLong: ['', [Validators.maxLength(25)]],
      businessArea: ['', [Validators.required]],
      forestRegion: ['', [Validators.required]],
      forestDistrict: ['', [Validators.required]],
      bcParksRegion: ['', [Validators.required]],
      bcParksSection: [{ value: '', disabled: true }, Validators.required],
      projectLead: ['', [Validators.maxLength(50)]],
      projectLeadEmail: ['', [Validators.email, Validators.maxLength(50)]],
      siteUnitName: ['', [Validators.maxLength(50)]],
      closestCommunity: ['', [Validators.required, Validators.maxLength(50)]],
  });

  // Dynamically enable/disable bcParksSection based on bcParksRegion selection
    this.projectForm.get('bcParksRegion')?.valueChanges.subscribe((regionId: number) => {
      if (regionId) {
        this.projectForm.get('bcParksSection')?.enable();
        this.bcParksSections = this.allBcParksSections.filter(
          (section) => section.parentOrgUnitId === regionId.toString()
        );
      } else {
        this.projectForm.get('bcParksSection')?.reset();
        this.projectForm.get('bcParksSection')?.disable();
        this.bcParksSections = [];
      }
    });
  }
  ngOnInit(): void {
    this.loadCodeTables(); // Call the helper method to load code tables
  }

  loadCodeTables(): void {
    const codeTables = [
      { name: 'programAreaCodes', property: 'businessAreas', embeddedKey: 'programArea' },
      { name: 'forestRegionCodes', property: 'forestRegions', embeddedKey: 'forestRegionCode' },
      { name: 'forestDistrictCodes', property: 'forestDistricts', embeddedKey: 'forestDistrictCode' },
      { name: 'bcParksRegionCodes', property: 'bcParksRegions', embeddedKey: 'bcParksRegionCode' },
      { name: 'bcParksSectionCodes', property: 'allBcParksSections', embeddedKey: 'bcParksSectionCode' },
    ];
  
    codeTables.forEach((table) => {
      this.codeTableService.fetchCodeTable(table.name).subscribe({
        next: (data) => {
          this[table.property] = data?._embedded?.[table.embeddedKey] || [];
        },
        error: (err) => {
          console.error(`Error fetching ${table.name}`, err);
        },
      });
    });
  }
  getErrorMessage(controlName: string): string | null {
    const control = this.projectForm.get(controlName);
    if (!control?.errors) return null;

    if (control.hasError('required')) {
      return this.messages.requiredField;
    }
    if (control.hasError('maxlength')) {
      return this.messages.maxLengthExceeded;
    }
    if (control.hasError('email')) {
      return this.messages.invalidEmail;
    }

    return null; // No errors
  }

  onCreate(): void {
    if (this.projectForm.valid) {
      const latLong = this.projectForm.get('latLong')?.value ?? '';
      let latitude = null;
      let longitude = null;

      if (latLong) {
        const parts = latLong.split(',').map((part: string) => part.trim());
        if (parts.length === 2) {
          const lat = parseFloat(parts[0]);
          const long = parseFloat(parts[1]);
      
          // Validate latitude and longitude range for BC
          if (
            !isNaN(lat) &&
            !isNaN(long) &&
            lat >= 48.3 &&
            lat <= 60 &&
            long >= -139 &&
            long <= -114
          ) {
            latitude = lat;
            longitude = long;
          } else {
            // Show an error message if latLong is outside BC's boundaries
            this.snackbarService.open(
              'Latitude and longitude must fall within British Columbia (Lat: 48.3–60, Long: -139 to -114).',
              'OK',
              { duration: 5000, panelClass: 'snackbar-error' }
            );
            return;
          }
        } else {
          // Show an error message if latLong is in an invalid format
          this.snackbarService.open(
            'Invalid latitude and longitude format.',
            'OK',
            { duration: 5000, panelClass: 'snackbar-error' }
          );
          return; // Exit the method if latLong is invalid
        }
      }

      const newProject: Project = {
        projectName: this.projectForm.get('projectName')?.value ?? '',
        programAreaGuid: this.projectForm.get('businessArea')?.value ?? '',
        forestRegionOrgUnitId: Number(this.projectForm.get('forestRegion')?.value) || 0,
        forestDistrictOrgUnitId: Number(this.projectForm.get('forestDistrict')?.value) || 0,
        bcParksRegionOrgUnitId: Number(this.projectForm.get('bcParksRegion')?.value) || 0,
        bcParksSectionOrgUnitId: Number(this.projectForm.get('bcParksSection')?.value) || 0,
        projectLead: this.projectForm.get('projectLead')?.value ?? '',
        projectLeadEmailAddress: this.projectForm.get('projectLeadEmail')?.value ?? '',
        siteUnitName: this.projectForm.get('siteUnitName')?.value ?? '',
        closestCommunityName: this.projectForm.get('closestCommunity')?.value ?? '',
        fireCentreOrgUnitId: this.projectForm.get('fireCentre')?.value ?? 0,
        generalScopeCode: {
          generalScopeCode: "SL_ACT"
        },
        projectTypeCode: {
          projectTypeCode: "FUEL_MGMT"
        },
        projectDescription: this.projectForm.get('projectDescription')?.value ?? '',
        projectNumber: this.projectForm.get('projectNumber')?.value ?? '',
        totalFundingRequestAmount:
          this.projectForm.get('totalFundingRequestAmount')?.value ?? '',
        totalAllocatedAmount: this.projectForm.get('totalAllocatedAmount')?.value ?? '',
        totalPlannedProjectSizeHa:
          this.projectForm.get('totalPlannedProjectSizeHa')?.value ?? '',
        totalPlannedCostPerHectare:
          this.projectForm.get('totalPlannedCostPerHectare')?.value ?? '',
        totalActualAmount: this.projectForm.get('totalActualAmount')?.value ?? 0,
        isMultiFiscalYearProj: false,
        latitude: Number(latitude),
        longitude: Number(longitude),
      };
      
      this.projectService.createProject(newProject).subscribe({
        next: (response) => {
          this.snackbarService.open(
            this.messages.projectCreatedSuccess,
            'OK',
            { duration: 100000, panelClass: 'snackbar-success' },
          );
          this.dialogRef.close({ success: true });
        },
        error: (err) =>{
          if (err.status === 500 && err.error.message.includes('duplicate')) {
            this.dialog.open(ConfirmationDialogComponent, {
              data: {
                indicator: 'duplicate-project',
                projectName: '',
              },
              width: '500px',
            });
          }
          else{
            this.snackbarService.open(
              "Create project failed",
              'OK',
              { duration: 5000, panelClass: 'snackbar-error' }
            );
          }
        }
      })
    }
  }

  onCancel(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        indicator: 'confirm-cancel',
      },
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.dialogRef.close(); // Close the "Create New Project" dialog
      }
    });
  }
}
