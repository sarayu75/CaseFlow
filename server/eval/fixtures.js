// Hand-labeled test cases for the CaseFlow AI evaluation harness. Each
// fixture pairs a synthetic case report with a small set of ground-truth
// expectations that can be checked automatically. Deliberately simple,
// unambiguous scenarios -- the goal is a reliable, repeatable signal, not
// maximum realism.

export const fixtures = [
  {
    id: "laptop-theft-office",
    title: "Office Laptop Theft",
    content: `On March 3, 2026, employee Sarah Chen reported that a company-issued laptop was missing from her desk at Meridian Consulting. She stated she left the laptop on her desk at 6:00 PM when she left for the day and discovered it missing when she arrived the next morning at 8:30 AM. The office was locked overnight and security records show no forced entry. No witnesses have come forward.`,
    expected: {
      people: ["Sarah Chen"],
      hasContradiction: false,
      minTimelineEvents: 2,
    },
  },
  {
    id: "school-fire-alarm-contradiction",
    title: "School Fire Alarm Timing Contradiction",
    content: `On April 10, 2026, a fire alarm was triggered at Lincoln Elementary School at 2:15 PM. Teacher Mark Ruiz stated that he saw smoke coming from the chemistry lab at 2:10 PM, before the alarm sounded. Janitor Louis Grant stated that he was in the chemistry lab at 2:10 PM and saw no smoke or fire at that time. The lab was later found to have a small electrical fire that had started near a wall outlet.`,
    expected: {
      people: ["Mark Ruiz", "Louis Grant"],
      hasContradiction: true,
      minTimelineEvents: 2,
    },
  },
  {
    id: "parking-lot-hit-and-run",
    title: "Parking Lot Hit and Run",
    content: `On May 2, 2026, a delivery van was found with a dented rear bumper in the parking lot of Bayview Apartments. Resident Elena Vasquez said she heard a loud noise around 11:40 PM but did not see what happened. Parking lot security footage from 11:38 PM shows a gray sedan backing into the van and then driving away without stopping. The sedan's license plate is not visible in the footage.`,
    expected: {
      people: ["Elena Vasquez"],
      hasContradiction: false,
      minTimelineEvents: 2,
    },
  },
  {
    id: "diner-register-alibi-conflict",
    title: "Diner Cash Register Alibi Conflict",
    content: `On June 18, 2026, cash was reported missing from the register at Sunrise Diner after closing. Manager Priya Nair said she counted the drawer at 9:00 PM and it was correct, then locked the restaurant and left at 9:15 PM. Cook Danny Okafor said he left the restaurant at 9:05 PM, before Priya finished counting the drawer. Register logs show the drawer was counted and locked at 9:12 PM, which is after Danny claims to have already left.`,
    expected: {
      people: ["Priya Nair", "Danny Okafor"],
      hasContradiction: true,
      minTimelineEvents: 3,
    },
  },
  {
    id: "package-delivery-confirmed",
    title: "Confirmed Package Delivery",
    content: `On July 7, 2026, resident Tom Baker reported his package as missing from the building's front desk. Delivery tracking shows it was delivered at 1:45 PM by courier James Whitfield, who took a photo confirming the drop-off. Building lobby security footage confirms the delivery was made and the package was placed on the shelf shown in the photo.`,
    expected: {
      people: ["Tom Baker", "James Whitfield"],
      hasContradiction: false,
      minTimelineEvents: 2,
    },
  },
  {
    id: "community-center-graffiti",
    title: "Community Center Graffiti",
    content: `On August 14, 2026, graffiti was discovered on the exterior wall of Ridgeview Community Center. Groundskeeper Alan Foster said the wall was clean when he left at 7:00 PM the previous evening and that he discovered the graffiti when he arrived at 6:00 AM. No security cameras cover that section of the building.`,
    expected: {
      people: ["Alan Foster"],
      hasContradiction: false,
      minTimelineEvents: 2,
    },
  },
  {
    id: "storage-room-badge-log-contradiction",
    title: "Storage Room Badge Log Contradiction",
    content: `On September 5, 2026, a company laptop went missing from a locked storage room at Hartwell Logistics. Employee Nina Torres said she was working at the loading dock the entire afternoon and never entered the storage room. Security badge logs show Nina Torres's badge was used to open the storage room door at 3:20 PM that same afternoon.`,
    expected: {
      people: ["Nina Torres"],
      hasContradiction: true,
      minTimelineEvents: 2,
    },
  },
  {
    id: "art-gallery-damage-corroborated",
    title: "Art Gallery Damage, Corroborated Timeline",
    content: `On October 22, 2026, a painting was found damaged at the Alden Art Gallery. Curator Robert Kim said he last inspected the painting undamaged at 4:00 PM. Security guard Wanda Price said she noticed the damage during her 6:00 PM round and immediately reported it. The visitor log shows the gallery had no visitors between 4:00 PM and 6:00 PM, confirmed by front desk staff member Julia Ahn.`,
    expected: {
      people: ["Robert Kim", "Wanda Price", "Julia Ahn"],
      hasContradiction: false,
      minTimelineEvents: 3,
    },
  },
];