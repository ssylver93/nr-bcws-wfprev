import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MapService } from 'src/app/services/map.service';
import L from 'leaflet';
import 'leaflet.markercluster';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [MatSlideToggleModule, CommonModule, MatExpansionModule], // Add FormsModule here
  templateUrl: './projects-list.component.html',
  styleUrls: ['./projects-list.component.scss'], // Corrected to 'styleUrls'
})
export class ProjectsListComponent implements AfterViewInit {
  map: any;
  markersLayer: any;
  customIcon = L.icon({
    iconUrl: '/assets/blue-pin-drop.svg', // Path to your custom marker image
    iconSize: [25, 41], // Specify the size of the icon [width, height]
    iconAnchor: [12, 41], // Anchor point for the icon [x, y]
    popupAnchor: [1, -34], // Anchor point for the popup relative to the icon [x, y]
    shadowSize: [41, 41], // Optional shadow size
    shadowAnchor: [12, 41], // Optional shadow anchor point
  });

  constructor(protected mapService: MapService) { }

  ngAfterViewInit(): void {
    setTimeout(() => { this.initializeLocationPins(); }, 2000);
    // this.initializeLocationPins();
  }
  sortOptions = [
    { label: 'Name (A-Z)', value: 'ascending' },
    { label: 'Name (Z-A)', value: 'descending' },
  ];

  selectedSort = '';
  syncWithMap = false;
  resultCount = 3;



  // MOCK UP DATA TO MACTCH UP THE REAL DATA MODEL
  projectList = [
    {
      projectTypeCode: {
        projectTypeCode: "FUEL_MGMT",
      },
      projectNumber: 12345,
      siteUnitName: "Vancouver Forest Unit",
      forestAreaCode: {
        forestAreaCode: "WEST",
      },
      generalScopeCode: {
        generalScopeCode: "SL_ACT",
      },
      programAreaGuid: "27602cd9-4b6e-9be0-e063-690a0a0afb50",
      projectName: "Sample Forest Management Project",
      projectLead: "Jane Smith",
      projectLeadEmailAddress: "jane.smith@example.com",
      projectDescription: "This is a comprehensive forest management project focusing on sustainable practices",
      closestCommunityName: "Vancouver",
      totalFundingRequestAmount: 100000.0,
      totalAllocatedAmount: 95000.0,
      totalPlannedProjectSizeHa: 500.0,
      totalPlannedCostPerHectare: 200.0,
      totalActualAmount: 0.0,
      isMultiFiscalYearProj: false,
      forestRegionOrgUnitId: 1001,
      forestDistrictOrgUnitId: 2001,
      fireCentreOrgUnitId: 3001,
      bcParksRegionOrgUnitId: 4001,
      bcParksSectionOrgUnitId: 5001,
    },
    {
      projectTypeCode: {
        projectTypeCode: "WLD_MGMT",
      },
      projectNumber: 67890,
      siteUnitName: "Kelowna Wildlife Zone",
      forestAreaCode: {
        forestAreaCode: "EAST",
      },
      generalScopeCode: {
        generalScopeCode: "WL_ACT",
      },
      programAreaGuid: "58672bcd-3e7f-8cd1-e053-680a0a0afc40",
      projectName: "Sustainable Fuel Management Initiative",
      projectLead: "John Doe",
      projectLeadEmailAddress: "john.doe@example.com",
      projectDescription: "An initiative to promote sustainable wildlife and fuel management practices",
      closestCommunityName: "Kelowna",
      totalFundingRequestAmount: 75000.0,
      totalAllocatedAmount: 70000.0,
      totalPlannedProjectSizeHa: 300.0,
      totalPlannedCostPerHectare: 250.0,
      totalActualAmount: 0.0,
      isMultiFiscalYearProj: true,
      forestRegionOrgUnitId: 1101,
      forestDistrictOrgUnitId: 2101,
      fireCentreOrgUnitId: 3101,
      bcParksRegionOrgUnitId: 4101,
      bcParksSectionOrgUnitId: 5101,
    },
    {
      projectTypeCode: {
        projectTypeCode: "URB_FOREST",
      },
      projectNumber: 11223,
      siteUnitName: "Prince George Forest Sector",
      forestAreaCode: {
        forestAreaCode: "NORTH",
      },
      generalScopeCode: {
        generalScopeCode: "UF_REV",
      },
      programAreaGuid: "19762acd-7d8a-4fe2-e043-680a0b0afc11",
      projectName: "Urban Forest Revitalization Program",
      projectLead: "Alice Brown",
      projectLeadEmailAddress: "alice.brown@example.com",
      projectDescription: "A program aimed at revitalizing urban forests in northern regions",
      closestCommunityName: "Prince George",
      totalFundingRequestAmount: 120000.0,
      totalAllocatedAmount: 115000.0,
      totalPlannedProjectSizeHa: 750.0,
      totalPlannedCostPerHectare: 160.0,
      totalActualAmount: 0.0,
      isMultiFiscalYearProj: true,
      forestRegionOrgUnitId: 1201,
      forestDistrictOrgUnitId: 2201,
      fireCentreOrgUnitId: 3201,
      bcParksRegionOrgUnitId: 4201,
      bcParksSectionOrgUnitId: 5201,
    },
  ];

  fiscalYearActivityTypes = ['Clearning', 'Burning', 'Pruning']


  onSortChange(event: any): void {
    this.selectedSort = event.target.value;
    console.log('Sort changed to:', this.selectedSort);
  }

  onSyncMapToggleChange(event: any): void {
    this.syncWithMap = event.checked;
    console.log('Sync with map:', this.syncWithMap ? 'On' : 'Off');
  }

  initializeLocationPins() {
    this.map = this.mapService.getMap();
    console.log('This is map:', this.map);

    // Add a tile layer to the map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

    // Initialize the marker cluster group with a custom iconCreateFunction
    const markersCluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount(); // Get the number of markers in the cluster
        return L.divIcon({
          html: `<div><span>${count}</span></div>`, // Display the count inside the cluster
          className: 'custom-marker-cluster', // Custom CSS class
          iconSize: L.point(40, 40), // Size of the cluster marker
        });
      },
    });

    // Example coordinates for markers
    const coordinates = [
      { lat: 48.417092, lng: -123.51134 },
      { lat: 48.4172, lng: -123.5115 },
      { lat: 48.4180, lng: -123.5100 },
      { lat: 48.4284, lng: -123.3656 }, // Victoria
      { lat: 49.2827, lng: -123.1207 }, // Vancouver
      { lat: 49.1666, lng: -123.9401 }, // Nanaimo
      { lat: 50.0331, lng: -125.2733 }, // Campbell River
      { lat: 50.1163, lng: -122.9574 }, // Whistler
      { lat: 49.8879, lng: -119.4960 }, // Kelowna
      { lat: 50.6745, lng: -120.3273 }, // Kamloops
      { lat: 53.9169, lng: -122.7497 }, // Prince George
      { lat: 54.5181, lng: -128.6034 }, // Terrace
      { lat: 55.7558, lng: -120.2381 }, // Fort St. John
      { lat: 52.1398, lng: -122.1440 }, // Williams Lake
      { lat: 49.3154, lng: -117.6593 }, // Nelson
      { lat: 49.4934, lng: -117.2948 }, // Castlegar
      { lat: 54.0106, lng: -125.2733 }, // Vanderhoof
      { lat: 58.8056, lng: -122.6980 }, // Fort Nelson
    ];

    // Add markers to the cluster group
    coordinates.forEach(coord => {
      const marker = L.marker([coord.lat, coord.lng], {
        icon: L.icon({
          iconUrl: '/assets/blue-pin-drop.svg',
          iconSize: [30, 50],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        }),
      });

      marker.bindPopup(`<p>Marker at (${coord.lat}, ${coord.lng})</p>`); // Optional popup
      markersCluster.addLayer(marker);
    });

    // Add the cluster group to the map
    this.map.addLayer(markersCluster);
  }

}
