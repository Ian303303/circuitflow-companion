/**
 * CircuitFlow Regulation Companion
 * ─────────────────────────────────
 * Drop-in route for CircuitFlow Vite app.
 */

import { useState, useEffect } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────
const C = {
  bg:      "#0A0F14",
  surface: "#111820",
  surf2:   "#1a2535",
  border:  "#1e3347",
  text:    "#E8F0F8",
  muted:   "#5a7a9a",
  cyan:    "#00D4FF",
  green:   "#00FF88",
  danger:  "#FF4D6A",
  warn:    "#FFB020",
  purple:  "#A78BFA",
  teal:    "#00BFA5",
};

// ─── FULL IRISH ZS TABLES (I.S. 10101 — 100% rule) ───────────────────────
const ZS = {
  MCB: {
    B: { 6:8.15, 10:4.89, 16:3.06, 20:2.44, 25:1.96, 32:1.53, 40:1.22, 50:0.97, 63:0.77, 80:0.61, 100:0.49, 125:0.39 },
    C: { 6:4.07, 10:2.44, 16:1.53, 20:1.22, 25:0.97, 32:0.76, 40:0.61, 50:0.49, 63:0.39, 80:0.31, 100:0.24, 125:0.19 },
    D: { 6:2.04, 10:1.22, 16:0.76, 20:0.61, 25:0.49, 32:0.38, 40:0.31, 50:0.24, 63:0.19, 80:0.15, 100:0.12, 125:0.10 },
  },
  RCBO: {
    B: { 6:8.15, 10:4.89, 16:3.06, 20:2.44, 25:1.96, 32:1.53, 40:1.22, 50:0.97, 63:0.77 },
    C: { 6:4.07, 10:2.44, 16:1.53, 20:1.22, 25:0.97, 32:0.76, 40:0.61, 50:0.49, 63:0.39 },
    D: { 6:2.04, 10:1.22, 16:0.76, 20:0.61, 25:0.49, 32:0.38, 40:0.31, 50:0.24, 63:0.19 },
  },
  Fuse_BS88: {
    _: { 6:7.67, 10:4.60, 16:2.87, 20:2.30, 25:1.84, 32:1.44, 40:1.15, 50:0.92, 63:0.73, 80:0.57, 100:0.46 },
  },
  Fuse_BS1361: {
    _: { 5:9.20, 15:3.07, 20:2.30, 30:1.53, 45:1.02, 60:0.77, 80:0.57, 100:0.46 },
  },
};

// ─── OBSERVATIONS ─────────────────────────────────────────────────────────
export const OBSERVATIONS = [
  { id:"OB0001", title:"Service head has black pitch/tar residue leaking from cable entry/side seals", code:"C3", reg:"I.S. 10101", section:"Origin", desc:"Service head has black pitch/tar residue leaking from cable entry/side seals or shows signs of leakage", proOnly:false },
  { id:"OB0002", title:"Lead sheath of the service cable split/damaged. No exposed live parts", code:"C3", reg:"I.S. 10101", section:"Origin", desc:"Lead sheath of the service cable split/damaged. No exposed live parts", proOnly:false },
  { id:"OB0003", title:"Service cable not adequately supported", code:"C3", reg:"I.S. 10101", section:"Origin", desc:"Service cable not adequately supported", proOnly:false },
  { id:"OB0004", title:"Service cut out has been damaged — exposed live parts", code:"C1", reg:"I.S. 10101", section:"Origin", desc:"Service cut out has been damaged — exposed live parts", proOnly:false },
  { id:"OB0005", title:"Service cut out has been damaged", code:"C3", reg:"ESQCR", section:"Origin", desc:"Service cut out has been damaged", proOnly:false },
  { id:"OB0006", title:"Incorrect connection of earthing conductor to TN-S earthing system", code:"C3", reg:"I.S. 10101", section:"Origin", desc:"Incorrect connection of earthing conductor to TN-S earthing system", proOnly:false },
  { id:"OB0007", title:"Service cut out fuse carrier seal not in place and properly secured", code:"C3", reg:"I.S. 10101", section:"Origin", desc:"Service cut out fuse carrier seal not in place and properly secured", proOnly:false },
  { id:"OB0008", title:"Neutral connection has exposed parts", code:"C3", reg:"I.S. 10101", section:"Origin", desc:"Neutral connection has exposed parts", proOnly:false },
  { id:"OB0009", title:"Metering equipment has been damaged", code:"C3", reg:"I.S. 10101", section:"Origin", desc:"Metering equipment has been damaged", proOnly:false },
  { id:"OB0010", title:"There is no earth bar inside the distribution board. No circuit protective conductors from final circuits", code:"C2", reg:"543.2", section:"Earthing", desc:"There is no earth bar inside the distribution board. No circuit protective conductors from final circuits", proOnly:false },
  { id:"OB0011", title:"There is no earth bar inside the distribution board. CPCs terminated to a common bolt", code:"C2", reg:"543.2", section:"Earthing", desc:"There is no earth bar inside the distribution board. Circuit protective conductors of final circuits are terminated to a common bolt and could potentially come loose", proOnly:false },
  { id:"OB0012", title:"No main protective bonding conductor present to main incoming service", code:"C2", reg:"411.3.1.2", section:"Earthing", desc:"No main protective bonding conductor present to main incoming service", proOnly:false },
  { id:"OB0013", title:"Unable to locate and verify the main protective bonding conductor at the main incoming service", code:"C3", reg:"411.3.1.2", section:"Earthing", desc:"Unable to locate and verify the main protective bonding conductor is present at the main incoming service", proOnly:false },
  { id:"OB0014", title:"Zs reading higher than 80% of that tabulated in Table 41.3 (MCBs)", code:"C2", reg:"411.3.3", section:"Earthing", desc:"Zs reading higher than 80% of that tabulated in Table 41.3 (MCBs)", proOnly:false },
  { id:"OB0015", title:"Zs reading higher than 80% of that tabulated in Table 41.2 (fuses 0.4 second)", code:"C2", reg:"411.3.3", section:"Earthing", desc:"Zs reading higher than 80% of that tabulated in Table 41.2 (fuses 0.4 second)", proOnly:false },
  { id:"OB0016", title:"Zs reading higher than 80% of that tabulated in Table 41.4 (fuses 5 second)", code:"C2", reg:"411.3.3", section:"Earthing", desc:"Zs reading higher than 80% of that tabulated in Table 41.4 (fuses 5 second)", proOnly:false },
  { id:"OB0017", title:"No flying leads from SWA earth rings to the earth bar of the distribution board", code:"C3", reg:"543.2.7", section:"Earthing", desc:"There are no flying leads from SWA earth rings to the earth bar of the distribution board. Earth continuity is electrically sound", proOnly:false },
  { id:"OB0018", title:"Incorrect type of earth clamp connected around the sheath of the sub-main/final circuit", code:"C2", reg:"522.8.1", section:"Earthing", desc:"Incorrect type of earth clamp connected around the sheath of the sub-main/final circuit", proOnly:false },
  { id:"OB0019", title:"Undersized main protective bonding conductor — above minimum but non-compliant", code:"C4", reg:"544.1.1", section:"Earthing", desc:"Undersized main protective bonding conductor. Size is above the minimum of 6mm but still does not meet the regulation requirement", proOnly:false },
  { id:"OB0020", title:"Undersized main protective bonding conductor — below minimum of 6mm", code:"C2", reg:"544.1.1", section:"Earthing", desc:"Undersized main protective bonding conductor. Size is below the minimum of 6mm (TN-S/TT) or 10mm (TN-C-S)", proOnly:false },
  { id:"OB0021", title:"Undersized main earth conductor for a TT/TN-S earthing arrangement", code:"C2", reg:"543.1.4, Table 54.7", section:"Earthing", desc:"Undersized main earth conductor for a TT/TN-S earthing arrangement", proOnly:false },
  { id:"OB0022", title:"Undersized main earth conductor for a TN-C-S (PME) earthing arrangement", code:"C2", reg:"543.1.4", section:"Earthing", desc:"Undersized main earth conductor for a TN-C-S (PME) earthing arrangement", proOnly:false },
  { id:"OB0023", title:"The backup generator does not have its own earth electrode", code:"C2", reg:"551.4.3.2", section:"Earthing", desc:"The backup generator does not have its own earth electrode", proOnly:false },
  { id:"OB0024", title:"Main protective bonding conductor to service not made as close as practicable to point of entry", code:"C3", reg:"544.1.2", section:"Earthing", desc:"The main protective bonding conductor to the service has not been made as close as practicable to its point of entry to the building", proOnly:false },
  { id:"OB0025", title:"Circuits supplying socket outlets with high protective conductor currents", code:"C2", reg:"543.7", section:"Earthing", desc:"Circuits supplying socket outlets which will supply electrical equipment with high protective conductor currents may require a high integrity earthing arrangement", proOnly:false },
  { id:"OB0026", title:"No continuity of ring final CPCs", code:"C2", reg:"543.3", section:"Earthing", desc:"No continuity of ring final CPCs", proOnly:false },
  { id:"OB0027", title:"Zs reading higher than calculated from instantaneous tripping current (BS 3871 Type 4)", code:"C2", reg:"I.S. 10101", section:"Earthing", desc:"Zs reading higher than that calculated from the instantaneous tripping current (BS 3871 Type 4)", proOnly:false },
  { id:"OB0028", title:"Zs reading higher than tabulated in technical document used to determine characteristics", code:"C2", reg:"I.S. 10101", section:"Earthing", desc:"Zs reading higher than that tabulated in the technical document used to determine the characteristics", proOnly:false },
  { id:"OB0029", title:"Metallic pipes with insulating section at point of entry connected to equipotential bonding", code:"C3", reg:"411.3.1.2", section:"Earthing", desc:"Metallic pipes entering the building having an insulating section at their point of entry are connected to the protective equipotential bonding", proOnly:false },
  { id:"OB0030", title:"Main incoming earthing conductor is stranded type — unable to determine size", code:"C3", reg:"543.1.1", section:"Earthing", desc:"Main incoming earthing conductor is of a stranded type — unable to determine its size", proOnly:false },
  { id:"OB0031", title:"Single conductor used to bond more than one incoming service — not kept continuous", code:"C2", reg:"528.3.3", section:"Earthing", desc:"Where a single conductor has been used to bond more than one incoming service, this has not been kept continuous", proOnly:false },
  { id:"OB0032", title:"A CPC must be terminated at every accessory", code:"C2", reg:"411.3.1.1", section:"Earthing", desc:"A CPC must be terminated at every accessory", proOnly:false },
  { id:"OB0033", title:"No continuity of protective conductor", code:"C2", reg:"643.2, 411.3.1.1", section:"Earthing", desc:"No continuity of protective conductor", proOnly:false },
  { id:"OB0034", title:"Earth electrode resistance approaching 200 ohm unstable value", code:"C3", reg:"411.5.3", section:"Earthing", desc:"Earth electrode resistance should be as low as possible. Result obtained is approaching the 200 ohm value above which it is considered unstable", proOnly:false },
  { id:"OB0035", title:"Earth electrode resistance greater than 200 ohm — considered unstable", code:"C2", reg:"411.5.3", section:"Earthing", desc:"Earth electrode resistance should be as low as possible. Result obtained is greater than the 200 ohm value above which it is considered unstable", proOnly:false },
  { id:"OB0036", title:"Earth electrode has been incorrectly installed", code:"C2", reg:"542.2.4", section:"Earthing", desc:"Earth electrode has been incorrectly installed", proOnly:false },
  { id:"OB0037", title:"Over-rated overcurrent protective device in relation to cable current-carrying capacity", code:"C2", reg:"433.1.1", section:"Protection", desc:"Over-rated overcurrent protective device in relation to the current-carrying capacity of the connected cables", proOnly:false },
  { id:"OB0038", title:"Over-rated OCPD — 70°C CCC tables used as temperature rating of load is unknown", code:"C2", reg:"433.1.1", section:"Protection", desc:"Over-rated overcurrent protective device. 70°C current-carrying capacity tables used as temperature rating of connected load is unknown", proOnly:false },
  { id:"OB0039", title:"Over-rated BS 3036 fuse wire", code:"C2", reg:"433.1", section:"Protection", desc:"Over-rated BS 3036 fuse wire", proOnly:false },
  { id:"OB0040", title:"Undersized conductor. Conductors in a ring must be rated at least 20A", code:"C2", reg:"533.2", section:"Protection", desc:"Undersized conductor. Conductors in a ring must be rated at least 20A", proOnly:false },
  { id:"OB0041", title:"Overrated fuse wire for the rating of the fuse carrier", code:"C2", reg:"533.1.2", section:"Protection", desc:"Overrated fuse wire for the rating of the fuse carrier", proOnly:false },
  { id:"OB0042", title:"Incorrect selectivity between protective devices of sub-main and final circuits", code:"C3", reg:"536.4.1.2", section:"Protection", desc:"Incorrect selectivity between protective devices of the sub-main and final circuits in order to provide safety and continuity of service", proOnly:false },
  { id:"OB0043", title:"Multiple circuits in the overcurrent protective device", code:"C3", reg:"314.4, 521.8.2", section:"Protection", desc:"Multiple circuits in the overcurrent protective device", proOnly:false },
  { id:"OB0044", title:"Three-phase circuit fed from three individual circuit breakers/fuses", code:"C2", reg:"431.1.1", section:"Protection", desc:"The three-phase circuit has been fed from three individual circuit breakers/fuses. Disconnection of a single phase in this three-phase circuit could cause danger", proOnly:false },
  { id:"OB0045", title:"No continuity of conductors on ring final circuit", code:"C2", reg:"433.1.204, 643.2.1", section:"Protection", desc:"No continuity of conductors on ring final circuit", proOnly:false },
  { id:"OB0046", title:"Short circuit kA rating of protective device less than Ipf measured at DB", code:"C2", reg:"434.5.1", section:"Protection", desc:"Short circuit (kA) rating of the protective device is less than the Ipf measured at the DB. Manufacturer information must be consulted to ensure energy let-through and back-up protection in place is adequate", proOnly:false },
  { id:"OB0047", title:"Circuits supplying IT equipment with protective conductor current exceeding 10mA", code:"C2", reg:"543.7", section:"Protection", desc:"Circuits supplying a large number of IT equipment where protective conductor current is expected to exceed 10mA shall be provided with a high integrity protective conductor", proOnly:false },
  { id:"OB0048", title:"MCCB installed does not provide correct overcurrent protection", code:"C2", reg:"433.1", section:"Protection", desc:"The MCCB installed does not provide the correct overcurrent protection to the associated circuit", proOnly:false },
  { id:"OB0049", title:"Overcurrent in one circuit could impair correct operation of safety services circuits", code:"C2", reg:"560.7.4", section:"Protection", desc:"Overcurrent protective devices shall be selected and erected so as to avoid an overcurrent in one circuit impairing the correct operation of circuits of safety services", proOnly:false },
  { id:"OB0050", title:"MCCB settings could not be determined — design information not available", code:"C3", reg:"411.4.5", section:"Protection", desc:"The settings on the MCCBs in DB could not be determined as design information was not made available. Maximum Zs readings could not be recorded", proOnly:false },
  { id:"OB0051", title:"Device within enclosure not compatible with manufacturer's equipment — no damage", code:"C3", reg:"536.4", section:"Protection", desc:"Device within the enclosure is not compatible with the original manufacturer's equipment. No signs of damage, arcing or thermal damage", proOnly:false },
  { id:"OB0052", title:"Incompatible device in enclosure — IP rating compromised, access to live parts", code:"C1", reg:"536.4", section:"Protection", desc:"Device within the enclosure is not compatible with the original manufacturer's equipment. IP rating compromised — access to live parts", proOnly:false },
  { id:"OB0053", title:"Incompatible device in enclosure — signs of damage, arcing or thermal damage", code:"C1", reg:"536.4", section:"Protection", desc:"Device within the enclosure is not compatible with the original manufacturer's equipment. Signs of damage, arcing or thermal damage", proOnly:false },
  { id:"OB0054", title:"Installation prior to 2022 — no evidence of overvoltage protection (SPD recommended)", code:"C4", reg:"534.4.1", section:"Protection", desc:"This installation was designed and installed prior to 2022. There is no evidence of overvoltage protection. Type 1/Type 2 surge protective devices are recommended", proOnly:false },
  { id:"OB0055", title:"Installation after 2022 — no evidence of overvoltage protection (SPD should be installed)", code:"C3", reg:"534.4.1", section:"Protection", desc:"This installation was designed and installed after 2022. There is no evidence of overvoltage protection. Type 1/Type 2 surge protective devices should be installed", proOnly:false },
  { id:"OB0056", title:"AFDD not provided for socket outlet circuits in Higher Risk Residential Buildings", code:"C4", reg:"421.7", section:"Protection", desc:"Arc fault detection devices (AFDD) conforming to BS EN 62606 have not been provided for single-phase AC final circuits supplying socket-outlets rated not exceeding 32A in HRRBs, HMOs, purpose-built student accommodation and care homes", proOnly:false },
  { id:"OB0057", title:"AFDD recommended for socket outlet circuits in other premises", code:"C3", reg:"421.7", section:"Protection", desc:"It is recommended that arc fault detection devices (AFDD) conforming to BS EN 62606 be provided for single-phase AC final circuits supplying socket-outlets rated not exceeding 32A", proOnly:false },
  { id:"OB0058", title:"Cables concealed less than 50mm from surface — RCD recommended", code:"C3", reg:"522.6", section:"RCD", desc:"Cables concealed within walls/partitions are likely embedded at a depth less than 50mm from the surface and not contained within an earthed metallic wiring system. An RCD is recommended", proOnly:false },
  { id:"OB0059", title:"No RCD protection for socket outlet circuits not exceeding 32A", code:"C2", reg:"411.3.3", section:"RCD", desc:"There is no RCD protection in place as an additional requirement for circuits supplying socket outlets not exceeding 32A. 30mA RCDs are recommended", proOnly:false },
  { id:"OB0060", title:"Type AC RCDs may only be selected for fixed equipment with no DC components", code:"C3", reg:"533.3.1", section:"RCD", desc:"Type AC RCDs may only be selected to supply fixed equipment where the load current contains no DC components", proOnly:false },
  { id:"OB0061", title:"RCD protection required for socket outlets supplying portable appliances outside", code:"C2", reg:"411.3.3", section:"RCD", desc:"RCD protection shall be provided for socket outlets that could potentially be used to supply portable appliances outside", proOnly:false },
  { id:"OB0062", title:"Additional RCD protection required in event of user carelessness", code:"C2", reg:"415.1.1", section:"RCD", desc:"Additional RCD protection is required in the event of user carelessness", proOnly:false },
  { id:"OB0063", title:"Low-voltage circuits in zones 1/2 of bathroom — 30mA RCDs recommended", code:"C3", reg:"701.415", section:"RCD", desc:"There are low-voltage circuits serving/passing through zones 1/2 of locations containing a bath/shower. 30mA RCDs are recommended to provide additional protection", proOnly:false },
  { id:"OB0064", title:"All circuits in area containing shower/bath should be protected by RCDs", code:"C2", reg:"701.415", section:"RCD", desc:"All circuits terminating within an area containing a shower/bath should be protected by RCDs", proOnly:false },
  { id:"OB0065", title:"RCD used for additional protection does not operate within the required time", code:"C2", reg:"643.8", section:"RCD", desc:"RCD used for additional protection does not operate within the required time", proOnly:false },
  { id:"OB0066", title:"Incorrect selectivity between RCDs", code:"C3", reg:"536.4.1.4", section:"RCD", desc:"Incorrect selectivity between RCDs", proOnly:false },
  { id:"OB0067", title:"RCD used for additional protection is nuisance tripping", code:"C3", reg:"531.3.2", section:"RCD", desc:"RCD used for additional protection is nuisance tripping", proOnly:false },
  { id:"OB0068", title:"Single RCD should be placed at origin for TT systems", code:"C2", reg:"531.3.5.3.1", section:"RCD", desc:"A single RCD should be placed at the origin, or the parts between the origin and the first item of equipment must meet the requirements of Class II equipment. Applicable to TT systems", proOnly:false },
  { id:"OB0069", title:"Absence of RCD/RCBO protection for accessories near sink and/or draining board", code:"C2", reg:"415.1.1", section:"RCD", desc:"Absence of RCD/RCBO protection for accessories located in close proximity to a sink and/or draining board", proOnly:false },
  { id:"OB0070", title:"30mA RCD not provided for AC final circuits supplying luminaires in domestic premises", code:"C2", reg:"411.3.4", section:"RCD", desc:"Additional protection by an RCD with rated residual operating current not exceeding 30mA shall be provided for AC final circuits supplying luminaires in domestic premises", proOnly:false },
  { id:"OB0071", title:"Damaged equipment with exposed live parts", code:"C1", reg:"416.3", section:"Wiring", desc:"Damaged equipment with exposed live parts. Detail of action taken for C1 situation (e.g. circuit isolated, replaced accessory, rectified at time of test)", proOnly:false },
  { id:"OB0072", title:"Damaged equipment — additional detail required", code:"C2", reg:"416.3", section:"Wiring", desc:"Damaged equipment. Additional detail required (e.g. burn mark from plug, cracked face plate)", proOnly:false },
  { id:"OB0073", title:"Minor damage to equipment", code:"C3", reg:"416.3", section:"Wiring", desc:"Minor damage to equipment", proOnly:false },
  { id:"OB0074", title:"Screws missing from DB cover — cover still secure", code:"C3", reg:"416.3", section:"Wiring", desc:"Screws missing from DB cover — cover still secure", proOnly:false },
  { id:"OB0075", title:"Screws missing from DB cover — cover is not secure", code:"C2", reg:"416.3", section:"Wiring", desc:"Screws missing from DB cover — cover is not secure", proOnly:false },
  { id:"OB0076", title:"Screws missing from accessory — accessory still secure", code:"C3", reg:"416.3", section:"Wiring", desc:"Screws missing from accessory — accessory still secure", proOnly:false },
  { id:"OB0077", title:"Cables left disconnected inside DB — should be terminated or removed", code:"C3", reg:"134.1.1", section:"Wiring", desc:"Cables left disconnected inside the DB should be terminated in a suitable accessory or removed to prevent inadvertent energisation", proOnly:false },
  { id:"OB0078", title:"No IP2X protection (hole >12mm) on bottom/side/front surface of enclosure", code:"C2", reg:"416.3, 411.2", section:"Wiring", desc:"No IP2X protection (hole >12mm) on the bottom/side/front surface of the enclosure", proOnly:false },
  { id:"OB0079", title:"No IP4X protection (hole >1mm) on top surface of enclosure", code:"C3", reg:"416.3, 411.2", section:"Wiring", desc:"No IP4X protection (hole >1mm) on the top surface of the enclosure", proOnly:false },
  { id:"OB0080", title:"Light fitting not fixed securely", code:"C2", reg:"559.5.2", section:"Wiring", desc:"Light fitting not fixed securely", proOnly:false },
  { id:"OB0081", title:"No grommet strip protection around cable entry hole", code:"C3", reg:"522.8.1", section:"Wiring", desc:"There is no grommet strip protection around the cable entry hole", proOnly:false },
  { id:"OB0082", title:"Trunking lid is missing", code:"C3", reg:"521.10", section:"Wiring", desc:"Trunking lid is missing", proOnly:false },
  { id:"OB0083", title:"No mechanical protection for single insulated cables", code:"C2", reg:"521.10", section:"Wiring", desc:"No mechanical protection for single insulated cables", proOnly:false },
  { id:"OB0084", title:"Excessive use of extension leads", code:"C3", reg:"554", section:"Wiring", desc:"There is an excessive use of extension leads", proOnly:false },
  { id:"OB0085", title:"Socket outlets not mounted high enough to minimise risk of mechanical damage", code:"C2", reg:"554", section:"Wiring", desc:"Socket outlets shall be mounted high enough to minimise the risk of mechanical damage to the socket outlet or to an associated plug and its flexible cord", proOnly:false },
  { id:"OB0086", title:"Flexible cable not held in flex grip/gland securely — no damage to cables", code:"C3", reg:"522.8.5", section:"Wiring", desc:"Flexible cable is not held in flex grip/gland securely. No damage to cables", proOnly:false },
  { id:"OB0087", title:"Flexible cable not held in flex grip/gland securely — cable is now damaged", code:"C2", reg:"522.8.5", section:"Wiring", desc:"Flexible cable is not held in flex grip/gland securely. Cable is now damaged", proOnly:false },
  { id:"OB0088", title:"Conductors distributed over different multi-core cables in three-phase circuit", code:"C2", reg:"521.8.1", section:"Wiring", desc:"Two T&E cables have been used for a three-phase circuit. Conductors must not be distributed over different multi-core cables", proOnly:false },
  { id:"OB0089", title:"Cables are not adequately supported", code:"C3", reg:"522.8.4", section:"Wiring", desc:"Cables are not adequately supported", proOnly:false },
  { id:"OB0090", title:"Wiring systems not supported to avoid premature collapse in event of fire", code:"C3", reg:"521.10", section:"Wiring", desc:"Wiring systems shall be supported such that they will not be liable to premature collapse in the event of a fire", proOnly:false },
  { id:"OB0091", title:"Cables running across suspended ceiling should be supported by other means", code:"C2", reg:"522.8.4", section:"Wiring", desc:"Cables that run across a suspended ceiling should be supported by other means", proOnly:false },
  { id:"OB0092", title:"Wiring system installed reduces general building structural performance or fire safety", code:"C2", reg:"527.1", section:"Wiring", desc:"A wiring system shall be installed so that the general building structural performance and fire safety are not reduced", proOnly:false },
  { id:"OB0093", title:"Isolator cannot be secured in the off position", code:"C2", reg:"537.2.4", section:"Wiring", desc:"The isolator cannot be secured in the off position", proOnly:false },
  { id:"OB0094", title:"Isolator for mechanical maintenance cannot be secured in the off position", code:"C2", reg:"537.2.4", section:"Wiring", desc:"The isolator for mechanical maintenance cannot be secured in the off position", proOnly:false },
  { id:"OB0095", title:"Incorrect IP protection for accessories near sink and/or draining board", code:"C2", reg:"421.2", section:"Wiring", desc:"Incorrect IP protection for accessories located in close proximity to a sink and/or draining board", proOnly:false },
  { id:"OB0096", title:"Consumer unit not manufactured from non-combustible material in domestic premises", code:"C4", reg:"421.2", section:"Wiring", desc:"Consumer unit/switchgear is not manufactured from non-combustible material or enclosed in a cabinet/enclosure constructed of non-combustible material within domestic premises", proOnly:false },
  { id:"OB0097", title:"No main switch present at origin to isolate the whole installation", code:"C2", reg:"462.2", section:"Wiring", desc:"There is no main switch present at the origin in order to isolate the whole installation", proOnly:false },
  { id:"OB0098", title:"Diffuser missing from light fitting", code:"C3", reg:"559.3", section:"Wiring", desc:"Diffuser missing from light fitting", proOnly:false },
  { id:"OB0099", title:"Presence of voltage exceeding 230V — labelling required", code:"C3", reg:"514.1", section:"Wiring", desc:"Presence of voltage exceeding 230V. Labelling required", proOnly:false },
  { id:"OB0100", title:"No neutral cover — the DB was manufactured to have one", code:"C3", reg:"416.2.3", section:"Wiring", desc:"No neutral cover. The DB was manufactured to have one", proOnly:false },
  { id:"OB0101", title:"Signs of corrosion within DB", code:"C2", reg:"522.5.1", section:"Wiring", desc:"Signs of corrosion within DB", proOnly:false },
  { id:"OB0102", title:"A CPC must be terminated at every accessory", code:"C2", reg:"411.3.1.1", section:"Wiring", desc:"A CPC must be terminated at every accessory", proOnly:false },
  { id:"OB0103", title:"Cables entering ferrous DB — not all conductors contained within same enclosure", code:"C3", reg:"521.5.1", section:"Wiring", desc:"All cables that enter a ferrous DB or enclosure should have all line, neutral and appropriate protective conductors contained within the same enclosure", proOnly:false },
  { id:"OB0104", title:"Ring circuit conductors of same size — resistance values not within 0.05 ohm", code:"C2", reg:"6.4.3.2", section:"Wiring", desc:"Ring circuit conductors of the same size shall have resistance values within 0.05 ohm of each other", proOnly:false },
  { id:"OB0105", title:"Wiring system not protected against condensation or ingress of water", code:"C2", reg:"522.3.1", section:"Wiring", desc:"A wiring system shall be selected and erected so that no damage is caused by condensation or ingress of water during installation, use or maintenance", proOnly:false },
  { id:"OB0106", title:"Wiring system not protected against mechanical stresses", code:"C2", reg:"522.6.1", section:"Wiring", desc:"Wiring system shall be selected and erected to minimise damage from mechanical stresses — impact, abrasion, penetration, tension or compression", proOnly:false },
  { id:"OB0107", title:"Cable supplying fire alarm panel is not fire-rated cable", code:"C3", reg:"560.8.1", section:"Wiring", desc:"Cable supplying the fire alarm panel is not fire-rated cable", proOnly:false },
  { id:"OB0108", title:"Poor adequacy of access to distribution board/consumer unit", code:"C3", reg:"132.12", section:"Wiring", desc:"Poor adequacy of access to distribution board/consumer unit", proOnly:false },
  { id:"OB0109", title:"Downlighters — no integral fire protection or fire hoods installed", code:"C2", reg:"421.1.2", section:"Wiring", desc:"Downlighters do not have integral fire protection or fire hoods installed. It is recommended that at least one of these be in place to reduce the risk of spread of fire", proOnly:false },
  { id:"OB0110", title:"Signs of heat damage to building fabric of downlighter — cause cannot be determined", code:"C2", reg:"421.1.2", section:"Wiring", desc:"There are signs of heat damage to the surrounding building fabric of the downlighter. The downlighter cannot be accessed to determine the cause of the heat damage", proOnly:false },
  { id:"OB0111", title:"Incorrect IP protection for accessories near sink and/or draining board", code:"C2", reg:"512.2", section:"Wiring", desc:"Incorrect IP protection for accessories located in close proximity to a sink and/or draining board", proOnly:false },
  { id:"OB0112", title:"Vulcanised Indian rubber (VIR) cable showing signs of deterioration", code:"C2", reg:"511.1", section:"Wiring", desc:"Vulcanised Indian rubber (VIR) cable has been installed and is showing signs of deterioration", proOnly:false },
  { id:"OB0113", title:"PVC/PVC cable clipped direct to external wall exposed to direct sunlight", code:"C2", reg:"522.11", section:"Wiring", desc:"PVC/PVC cable clipped direct to an external wall exposed to direct sunlight", proOnly:false },
  { id:"OB0114", title:"Insulation resistance reading below minimum tabulated value", code:"C2", reg:"6.4.3.3.1, Table 6.1", section:"Wiring", desc:"Insulation resistance reading taken is below the minimum tabulated value", proOnly:false },
  { id:"OB0115", title:"Incorrect polarity on circuit or connection at piece of equipment", code:"C1", reg:"6.4.3.6", section:"Wiring", desc:"Incorrect polarity on the circuit or connection at piece of equipment", proOnly:false },
  { id:"OB0116", title:"Incorrect polarity on Edison screw lampholders", code:"C1", reg:"6.4.3.6", section:"Wiring", desc:"Incorrect polarity on Edison screw lampholders", proOnly:false },
  { id:"OB0117", title:"No segregation of circuits (fire alarm/emergency lighting)", code:"C3", reg:"527", section:"Wiring", desc:"No segregation of circuits (fire alarm/emergency lighting)", proOnly:false },
  { id:"OB0118", title:"No segregation of circuits (data cables)", code:"C3", reg:"528.2", section:"Wiring", desc:"No segregation of circuits (data cables)", proOnly:false },
  { id:"OB0119", title:"No segregation of circuits and heating pipes", code:"C2", reg:"528.3.1", section:"Wiring", desc:"No segregation of circuits and heating pipes", proOnly:false },
  { id:"OB0120", title:"Cable must not be run in an active lift shaft", code:"C2", reg:"528.3.5", section:"Wiring", desc:"Cable must not be run in an active lift shaft", proOnly:false },
  { id:"OB0121", title:"Inadequate protection against corrosion where earth electrode terminates", code:"C2", reg:"542.2.1", section:"Wiring", desc:"Inadequate protection against corrosion where earth electrode terminates", proOnly:false },
  { id:"OB0122", title:"Cables and equipment installed in protected escape route for non-permitted purpose", code:"C3", reg:"N/A", section:"Wiring", desc:"Cables and electrical equipment have been installed in a protected escape route for a purpose other than fire safety, safety systems, general needs lighting or maintenance socket outlets", proOnly:false },
  { id:"OB0123", title:"Cables in fire risk location — do not meet BS EN 60332-1-2 requirements", code:"C3", reg:"422.3.4", section:"Wiring", desc:"Cables within locations with risks of fire, due to the nature of processed or stored materials, do not meet the requirements of BS EN 60332-1-2", proOnly:false },
  { id:"OB0322", title:"All untraced circuits must have their circuit designations verified", code:"C2", reg:"514.4", section:"Identification", desc:"All untraced circuits must have their circuit designations verified", proOnly:false },
  { id:"OB0323", title:"Unidentified circuits — designations should be verified and circuit charts updated", code:"C2", reg:"514.4", section:"Identification", desc:"Unidentified circuits, not tested due to isolation issues, should have their designations verified and circuit charts updated", proOnly:false },
  { id:"OB0324", title:"Circuit isolated at time of test — still terminated into overcurrent device", code:"C2", reg:"537.2.4", section:"Identification", desc:"Circuit isolated at time of test and still terminated into overcurrent device. Further investigation required", proOnly:false },
  { id:"OB0325", title:"Circuits not arranged or marked so they can be identified for inspection and testing", code:"C3", reg:"514.3.1", section:"Identification", desc:"Circuits are not arranged or marked so they can be identified for inspection and testing", proOnly:false },
  { id:"OB0326", title:"Live conductors are incorrectly identified", code:"C3", reg:"514.3.1", section:"Identification", desc:"Live conductors are incorrectly identified", proOnly:false },
  { id:"OB0327", title:"Circuit protective conductor is incorrectly identified", code:"C3", reg:"514.3", section:"Identification", desc:"Circuit protective conductor is incorrectly identified", proOnly:false },
  { id:"OB0328", title:"CPCs shall not be green only", code:"C3", reg:"514.4", section:"Identification", desc:"CPCs shall not be green only", proOnly:false },
  { id:"OB0329", title:"No bonding label present at the termination", code:"C3", reg:"514.1", section:"Identification", desc:"There is no bonding label present at the termination", proOnly:false },
  { id:"OB0330", title:"Isolators have no labels indicating their purpose", code:"C3", reg:"514.1", section:"Identification", desc:"Isolators have no labels indicating their purpose", proOnly:false },
  { id:"OB0331", title:"Device for switching off for mechanical maintenance not durably marked", code:"C3", reg:"534.3.2.4", section:"Identification", desc:"A device for switching off for mechanical maintenance shall be so placed and durably marked to be readily identifiable and convenient for its intended use", proOnly:false },
  { id:"OB0332", title:"No detailed legible diagram, chart or table provided near distribution board", code:"C3", reg:"514.5", section:"Identification", desc:"A detailed legible diagram, chart or table has not been provided in the vicinity of the distribution board indicating type and composition of circuits", proOnly:false },
  { id:"OB0333", title:"Bare CPC conductor does not have sleeving installed", code:"C2", reg:"514.3", section:"Identification", desc:"Bare CPC conductor does not have sleeving installed", proOnly:false },
  { id:"OB0334", title:"No alternative supply warning notice at consumer unit/distribution board", code:"C3", reg:"514.1", section:"Identification", desc:"No presence of alternative supply warning notice at consumer unit/distribution board", proOnly:false },
  { id:"OB0335", title:"Group 1 medical location — final circuits up to 32A require 30mA RCD protection", code:"C2", reg:"710.411.4", section:"Special Locations", desc:"All final circuits of Group 1 medical locations rated up to 32A shall have additional 30mA RCD protection", proOnly:true },
  { id:"OB0336", title:"Group 1/2 — protective conductor resistance between socket and extraneous parts exceeds 0.2Ω", code:"C2", reg:"710.415.2.2", section:"Special Locations", desc:"Within Group 1 and 2 locations, the measured resistance of the protective conductor shall not exceed 0.2Ω", proOnly:true },
  { id:"OB0337", title:"No supplementary bonding conductors between extraneous-conductive-parts in Group 1/2 location", code:"C2", reg:"710.415.2.1", section:"Special Locations", desc:"There are no supplementary bonding conductors installed between extraneous-conductive-parts and the main equipotential bonding busbar within a Group 1/Group 2 location", proOnly:true },
  { id:"OB0338", title:"No additional RCD for final circuits supplying operating tables/X-ray in Group 2", code:"C2", reg:"710.411.4", section:"Special Locations", desc:"There is no additional RCD protection for final circuits supplying movements of fixed operating tables, X-ray units and large equipment with rated power greater than 5kVA in a Group 2 medical location", proOnly:true },
  { id:"OB0339", title:"No equipotential bonding busbar installed in or near Group 1/2 medical location", code:"C2", reg:"710.415.2.101", section:"Special Locations", desc:"There is no equipotential bonding busbar installed in or near the Group 1/Group 2 medical location", proOnly:true },
  { id:"OB0340", title:"Lighting circuit in Group 1/2 medical location not fed from two different sources", code:"C2", reg:"710.559.101", section:"Special Locations", desc:"Lighting circuit installed within Group 1/Group 2 of a medical location has not been fed from two different sources of supply", proOnly:true },
  { id:"OB0341", title:"Light switch/socket within 200mm of medical gas outlet for oxidising/flammable gases", code:"C2", reg:"710.512.2.1", section:"Special Locations", desc:"Light switch/socket has been installed within 200mm of a medical gas outlet for oxidising/flammable gases", proOnly:true },
  { id:"OB0342", title:"Group 2 medical — medical IT system not used for life support/surgical circuits", code:"C3", reg:"710.411.4", section:"Special Locations", desc:"In Group 2 medical locations, a medical IT system has not been used for final circuits for ME equipment and ME systems intended for life support and surgical applications", proOnly:true },
  { id:"OB0350", title:"Low-voltage circuits in zones 1/2 of bathroom — 30mA RCDs recommended", code:"C2", reg:"701.410.3", section:"Special Locations", desc:"There are low-voltage circuits serving/passing through zones 1/2 of locations containing a bath/shower. 30mA RCDs are recommended to provide additional protection", proOnly:false },
  { id:"OB0351", title:"All circuits terminating within shower/bath area should be protected by RCDs", code:"C2", reg:"701.410.3", section:"Special Locations", desc:"All circuits that terminate within an area containing a shower/bath should be protected by RCDs", proOnly:false },
  { id:"OB0352", title:"Accessible socket outlet installed within 2.5m of Zone 1", code:"C2", reg:"701.512.4", section:"Special Locations", desc:"Accessible socket outlet installed within 2.5m of Zone 1", proOnly:false },
  { id:"OB0353", title:"Accessible socket outlet within 2.5m of Zone 1 — no RCD protection", code:"C2", reg:"701.512.2", section:"Special Locations", desc:"Accessible socket outlet installed within 2.5m of Zone 1 with no RCD protection", proOnly:false },
  { id:"OB0354", title:"Equipment in zones 1 and 2 require at least IPX4 degree of protection", code:"C2", reg:"701", section:"Special Locations", desc:"Items of equipment installed within zones 1 and 2 require a degree of protection of at least IPX4", proOnly:false },
  { id:"OB0355", title:"Shaver socket is damaged and has exposed live parts", code:"C1", reg:"I.S. 10101", section:"Special Locations", desc:"Shaver socket complying with BS EN 61558-2 is damaged and has exposed live parts", proOnly:false },
  { id:"OB0391", title:"AC output from PV system not connected to supply side of overcurrent protective device", code:"C2", reg:"712.431.102", section:"Special Locations", desc:"The AC output from the PV system is not connected to the supply side of the overcurrent protective device supplying current-using equipment", proOnly:false },
  { id:"OB0392", title:"AC output from PV system not protected by Type B RCD — inverter capable of DC feedback", code:"C2", reg:"712.530.3.101", section:"Special Locations", desc:"The AC output from the PV system is not protected by a Type B RCD where the PV inverter is capable of DC feedback into the installation", proOnly:false },
  { id:"OB0393", title:"AC output from PV system not protected by Type B RCD — DC feedback capability unknown", code:"C2", reg:"712.530.3.101", section:"Special Locations", desc:"The AC output from the PV system is not protected by a Type B RCD — it is not known if the PV inverter is capable of DC feedback into the installation", proOnly:false },
  { id:"OB0394", title:"No adequate method for isolating PV inverter from AC side", code:"C2", reg:"712.537.101", section:"Special Locations", desc:"There is no adequate method for isolating the PV inverter from the AC side", proOnly:false },
  { id:"OB0395", title:"No adequate method for isolating PV inverter from DC side", code:"C2", reg:"712.537.2.2.101", section:"Special Locations", desc:"There is no adequate method for isolating the PV inverter from the DC side", proOnly:false },
  { id:"OB0400", title:"EV charging point not supplied from a dedicated final circuit", code:"C2", reg:"722.533.101", section:"Special Locations", desc:"The EV charging point has not been supplied from a dedicated final circuit", proOnly:false },
  { id:"OB0401", title:"EV charging point installed outdoors — does not meet minimum IPX4 rating", code:"C2", reg:"722.512.2.101", section:"Special Locations", desc:"The EV charging point has been installed outdoors and does not meet the minimum IPX4 rating", proOnly:false },
  { id:"OB0402", title:"EV charging point supply protected by AC type RCD", code:"C2", reg:"722.531.3.101", section:"Special Locations", desc:"The EV charging point supply is protected by an AC type RCD", proOnly:false },
  { id:"OB0403", title:"EV charging point supply protected by Type A RCD with DC residual current exceeding 6mA", code:"C2", reg:"722.531.3.101", section:"Special Locations", desc:"The EV charging point supply is protected by an A type RCD with DC residual current exceeding 6mA", proOnly:false },
  { id:"OB0404", title:"EV charging point supplied via single-pole RCD", code:"C2", reg:"722.531.3.101", section:"Special Locations", desc:"The EV charging point has been supplied via a single-pole RCD", proOnly:false },
  { id:"OB0405", title:"Socket outlet for EV charging not suitably labelled", code:"C3", reg:"722.55.101.1", section:"Special Locations", desc:"The socket outlet installed for EV charging has not been suitably labelled", proOnly:false },
  { id:"OB0406", title:"Suspected asbestos present within distribution board", code:"C3", reg:"I.S. 10101", section:"Other", desc:"Suspected asbestos present within distribution board. This should be proven otherwise and a record held on site, or professionally removed", proOnly:false },
];

// ─── REGULATIONS ──────────────────────────────────────────────────────────
export const REGULATIONS = [
  { num:"411.3.3", title:"RCD Protection — Socket Outlets", body:"Socket outlets with a rated current not exceeding 32A intended for use by ordinary persons shall be protected by one or more RCDs each having a rated residual operating current not exceeding 30mA." },
  { num:"411.4.4", title:"Maximum Earth Fault Loop Impedance", body:"The earth fault loop impedance Zs shall not exceed the value for which the overcurrent protective device will operate within the required disconnection time. See Appendix 4 for maximum Zs values." },
  { num:"443.4", title:"Surge Protective Devices", body:"Where the consequences of overvoltage could cause danger to persons, serious financial loss or interruption of essential services, surge protective devices shall be provided." },
  { num:"514.8.1", title:"Circuit Identification", body:"Every circuit shall be so identified that it is possible to determine the purpose of the circuit and, if necessary, to identify the circuit to which any wiring belongs." },
  { num:"521.5.1", title:"Current-Carrying Capacity", body:"The current-carrying capacity of a conductor shall not be less than the design current of the circuit it serves." },
  { num:"526.1", title:"Electrical Connections", body:"Every connection between conductors or between a conductor and equipment shall provide durable electrical continuity and adequate mechanical strength and protection." },
  { num:"530.3.3", title:"Switching in Neutral", body:"A single-pole switching or protective device shall not be inserted in the neutral conductor." },
  { num:"537.1.2", title:"Isolation at Origin", body:"A means of isolation shall be provided at the origin of every installation, enabling the installation to be isolated from the supply. The means of isolation shall disconnect all live conductors." },
  { num:"542.1.1", title:"Earthing Arrangements", body:"An earthing conductor connecting the main earthing terminal to the means of earthing shall be provided. It shall be suitably protected against corrosion and mechanical damage." },
  { num:"544.1.1", title:"Main Protective Bonding", body:"Protective bonding conductors shall connect the main earthing terminal to extraneous-conductive-parts including water, gas, oil pipework and structural steel that are liable to introduce a potential." },
  { num:"612.2", title:"Continuity of Protective Conductors", body:"The continuity of each protective conductor, including the main and supplementary bonding conductors, shall be verified by test." },
  { num:"612.3", title:"Insulation Resistance", body:"The insulation resistance shall be measured between live conductors connected together and earth. The insulation resistance shall not be less than the value in Table 61." },
  { num:"612.6", title:"Polarity", body:"A test shall be made to verify that all fuses, switches and single-pole control devices are connected in the line conductor only and that all circuits are correctly connected." },
  { num:"701.415.2", title:"Bathrooms — Supplementary Bonding", body:"Supplementary protective bonding shall connect simultaneously accessible exposed-conductive-parts and extraneous-conductive-parts within zones 1 and 2 of a bathroom." },
  { num:"701.512.3", title:"Bathrooms — Socket Outlets", body:"Socket outlets shall not be installed in zones 0, 1 or 2. Shaver supply units complying with BS EN 61558-2-5 may be installed outside zone 0." },
  { num:"722.531.2", title:"EV Charging — RCD", body:"Every electric vehicle charging point shall be provided with an RCD of Type B, unless a device providing equivalent protection against all AC and DC fault currents is used." },
  { num:"722.411.4", title:"EV — PME Supply", body:"Where a PME earthing facility is used, the earth terminal of a charging point shall be connected to an earth electrode unless a protective device operating within 5 seconds is provided." },
  { num:"421.1.7", title:"AFDD — Sleeping Accommodation", body:"Where a circuit supplies sleeping accommodation, consideration shall be given to the installation of an arc fault detection device to provide additional protection." },
  { num:"433.1", title:"Overload Protection", body:"Every circuit shall be protected against overload current. The characteristics of the protective device shall satisfy the conditions relating to design current and conductor current-carrying capacity." },
];

// ─── SPECIAL LOCATIONS ────────────────────────────────────────────────────
const LOCATIONS = [
  { icon:"🚿", name:"Bathrooms & Shower Rooms", ref:"Part 701", color:C.cyan, proOnly:false,
    items:[
      { label:"Zone 0", value:"Inside bath/shower trough only. IPX7 minimum. SELV ≤12V AC / 30V DC only." },
      { label:"Zone 1", value:"Above bath/shower trough to 2.25m height. IPX4 minimum. SELV, shaver units (BS EN 61558-2-5) or fixed equipment only." },
      { label:"Zone 2", value:"0.6m beyond zone 1 edge. IPX4 minimum. All zone 1 equipment plus SELV and other permitted items." },
      { label:"RCD protection", value:"30mA RCD required for all circuits in zones 0, 1 and 2." },
      { label:"Supplementary bonding", value:"Required between simultaneously accessible exposed and extraneous-conductive-parts unless all circuits are RCD protected at ≤30mA." },
      { label:"Socket outlets", value:"Not permitted in zones 0, 1 or 2. Shaver units only if compliant with BS EN 61558-2-5." },
      { label:"Regulation", value:"I.S. 10101 Part 701" },
    ]
  },
  { icon:"🏊", name:"Swimming Pools", ref:"Part 702", color:C.green, proOnly:false,
    items:[
      { label:"Zone A", value:"Inside water volume. IPX8. SELV ≤12V AC / 30V ripple-free DC only. No switching devices." },
      { label:"Zone B", value:"0–2m from water edge, 0–2.5m height. IPX5. SELV or special transformers permitted." },
      { label:"Zone C", value:"2–3.5m from water edge. IPX2 indoor / IPX4 outdoor. Standard equipment permitted." },
      { label:"RCD protection", value:"All circuits in zones A, B and C must be protected by 30mA RCD." },
      { label:"Equipotential bonding", value:"All extraneous-conductive-parts within zones A, B, C must be connected to supplementary equipotential bonding." },
      { label:"Regulation", value:"I.S. 10101 Part 702" },
    ]
  },
  { icon:"🧖", name:"Sauna Rooms", ref:"Part 703", color:C.warn, proOnly:false,
    items:[
      { label:"Zone 1", value:"To 0.5m above floor. Equipment must withstand 125°C ambient." },
      { label:"Zone 2", value:"0.5m–1.5m above floor. Equipment must withstand 125°C ambient." },
      { label:"Zone 3", value:"Remainder of sauna room. 125°C ambient." },
      { label:"Wiring systems", value:"Heat-resistant cables only (mineral insulated or equivalent). No PVC in zones 1–3." },
      { label:"Controls", value:"Control and protective devices must be located outside the sauna room." },
      { label:"RCD", value:"30mA RCD protection required for all sauna circuits." },
      { label:"Regulation", value:"I.S. 10101 Part 703" },
    ]
  },
  { icon:"🐄", name:"Agricultural Locations", ref:"Part 705", color:C.teal, proOnly:false,
    items:[
      { label:"Wiring systems", value:"Cables must be protected against mechanical damage, moisture and animal activity. Armoured or conduit recommended." },
      { label:"RCD", value:"30mA RCD for socket outlet circuits. 100mA or 300mA for fixed equipment where 30mA is impractical." },
      { label:"Equipotential bonding", value:"Supplementary equipotential bonding required in animal husbandry locations to limit step and touch voltages." },
      { label:"Disconnection time", value:"0.2 seconds maximum for TN systems. Livestock are more sensitive to electric shock than humans." },
      { label:"IP rating", value:"IP44 minimum for all equipment in agricultural buildings." },
      { label:"Socket outlets", value:"Industrial type (BS EN 60309) preferred. At least 1m above floor level." },
      { label:"Regulation", value:"I.S. 10101 Part 705" },
    ]
  },
  { icon:"⚡", name:"Conducting Locations", ref:"Part 706", color:C.purple, proOnly:false,
    items:[
      { label:"Definition", value:"Locations with conductive surroundings where risk of electric shock is increased — boiler rooms, metal tanks, confined metalwork." },
      { label:"SELV / PELV", value:"SELV or PELV at ≤25V AC / 60V DC recommended for portable tools and local lighting." },
      { label:"RCD", value:"30mA RCD required on all circuits supplying equipment within the location." },
      { label:"Equipotential bonding", value:"All metalwork must be interconnected and bonded to earth." },
      { label:"Flexible cables", value:"Heavy duty flexible cables with reinforced sheath required for portable equipment." },
      { label:"Regulation", value:"I.S. 10101 Part 706" },
    ]
  },
  { icon:"🚗", name:"EV Charging Installations", ref:"Part 722", color:"#4FC3F7", proOnly:false,
    items:[
      { label:"RCD Type B", value:"Every charging point must have Type B RCD unless equivalent DC fault protection is built into the EVCP." },
      { label:"Dedicated circuit", value:"Each charging point should be served by a dedicated final circuit from the consumer unit." },
      { label:"PME supply", value:"PME earthing must not be used as the means of earthing for EV charging equipment unless an earth electrode and additional protective measures are applied." },
      { label:"Load management", value:"Consider supply capacity and diversity. Smart charging / demand management recommended." },
      { label:"IP rating", value:"IP44 minimum for outdoor installations." },
      { label:"Regulation", value:"I.S. 10101 Part 722 / ESB Networks guidance" },
    ]
  },
  { icon:"☀️", name:"Solar PV Systems", ref:"Part 712", color:"#FFD23F", proOnly:false,
    items:[
      { label:"DC wiring", value:"DC cables must be PV-specific, UV-resistant, double-insulated. Segregated from AC wiring." },
      { label:"Isolation", value:"AC and DC isolation required. DC isolator at inverter and at array." },
      { label:"RCD", value:"Type B or equivalent required on AC side if inverter does not have built-in DC fault monitoring." },
      { label:"SPD", value:"Surge protection recommended on both AC and DC sides." },
      { label:"Generation meter", value:"Bidirectional meter required for grid-connected systems. ESB Networks approval required." },
      { label:"Labelling", value:"Warning labels required at consumer unit, meter, inverter and roof penetration points." },
      { label:"Regulation", value:"I.S. 10101 Part 712 / SEAI guidelines" },
    ]
  },
  { icon:"🏥", name:"Medical Locations", ref:"Part 710", color:C.danger, proOnly:true,
    items:[
      { label:"Group 0", value:"No medical electrical equipment applied to patient. Standard protection applies." },
      { label:"Group 1", value:"External or non-invasive equipment applied to patient. Enhanced protection required." },
      { label:"Group 2", value:"Invasive procedures, life-support, operating theatres. IT system required." },
      { label:"IT system", value:"IT power systems with insulation monitoring required for Group 2. Maximum touch voltage 25V." },
      { label:"RCD", value:"30mA RCD for final circuits in Group 1 and 2 (except IT circuits)." },
      { label:"Equipotential bonding", value:"All metalwork within 2.5m of patient environment must be bonded to supplementary equipotential bonding bar." },
      { label:"Regulation", value:"I.S. 10101 Part 710" },
    ]
  },
];

// ─── RCD DATA ─────────────────────────────────────────────────────────────
const RCD_TYPES = [
  { label:"30mA General Purpose", color:C.green, icon:"🟢", note:"Socket outlets, bathroom circuits, general final circuits",
    rows:[{test:"½ × IΔn (15mA)",limit:"No trip",hi:false},{test:"1 × IΔn (30mA)",limit:"≤ 300ms",hi:true},{test:"5 × IΔn (150mA)",limit:"≤ 40ms",hi:true}] },
  { label:"100mA S-Type (Selective)", color:"#4FC3F7", icon:"🔵", note:"Time-delayed. Upstream of 30mA RCDs for discrimination",
    rows:[{test:"½ × IΔn (50mA)",limit:"No trip",hi:false},{test:"1 × IΔn (100mA)",limit:"130–500ms",hi:true},{test:"5 × IΔn (500mA)",limit:"≤ 150ms",hi:true}] },
  { label:"30mA Type B (DC fault)", color:C.warn, icon:"🟡", note:"Required for EV charging, solar PV inverters, VSD drives",
    rows:[{test:"½ × IΔn (15mA)",limit:"No trip",hi:false},{test:"1 × IΔn (30mA)",limit:"≤ 300ms",hi:true},{test:"5 × IΔn (150mA)",limit:"≤ 40ms",hi:true}] },
  { label:"300mA Fire Protection", color:C.danger, icon:"🔴", note:"Protection against fire risk in cable installations",
    rows:[{test:"½ × IΔn (150mA)",limit:"No trip",hi:false},{test:"1 × IΔn (300mA)",limit:"≤ 500ms",hi:true},{test:"5 × IΔn (1500mA)",limit:"≤ 150ms",hi:true}] },
];

// ─── CHECKLISTS ───────────────────────────────────────────────────────────
const CHECKLISTS = {
  db: { label:"Distribution Board", items:[
    "Earthing conductor present and correctly sized",
    "Main protective bonding installed — water, gas, structural steel",
    "Supplementary bonding where required",
    "RCD protection — type and rating correct for circuits",
    "SPD installed, or absence recorded and justified",
    "All circuits correctly identified",
    "IP rating of enclosure adequate for location",
    "No signs of overheating, arcing or insulation damage",
    "Isolation means accessible and functional",
    "Warning labels and notices present",
    "Cable entries sealed / fire-stopped",
    "No exposed live parts accessible with door closed",
  ]},
  socket: { label:"Socket Circuit", items:[
    "Circuit rating appropriate for intended load",
    "RCD protection ≤30mA installed",
    "CPC continuity verified by test",
    "Insulation resistance satisfactory (≥1MΩ)",
    "Polarity correct at all outlets",
    "Zs within limits for device type and rating",
    "Socket outlets correctly rated and mounted",
    "No signs of overloading or damage visible",
  ]},
  lighting: { label:"Lighting Circuit", items:[
    "Circuit rating appropriate",
    "CPC present and continuous throughout circuit",
    "Insulation resistance satisfactory",
    "Polarity correct at all switch and lighting points",
    "Zs within limits",
    "Switching in line conductor only — not neutral",
    "AFDD installed where required (sleeping areas)",
    "All lampholders and fittings earthed where required",
  ]},
  eicr: { label:"EICR Pre-check", items:[
    "Client details confirmed",
    "Installation age and last inspection date recorded",
    "Supply characteristics confirmed (voltage, earthing system)",
    "Maximum demand assessed",
    "Ze measured at origin",
    "Presence and condition of earthing arrangements confirmed",
    "Presence and condition of bonding conductors confirmed",
    "Schedule of circuit details completed",
    "All test instruments calibrated and within date",
    "Risk assessment completed before opening live equipment",
  ]},
};

// ═══════════════════════════════════════════════════════════════════════════
// SHARED STYLES & COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════
const st = {
  screen: { padding:"0 0 90px" },
  card: { background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:16, marginBottom:10 },
  seg: { display:"flex", background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:3, gap:3, marginBottom:12 },
  segB: (a) => ({ flex:1, padding:"8px 4px", borderRadius:7, border: a?`1px solid ${C.border}`:"1px solid transparent", background:a?C.surf2:"transparent", color:a?C.cyan:C.muted, fontWeight:700, fontSize:13, cursor:"pointer", transition:"all 0.15s", fontFamily:"inherit" }),
  label: { fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:1.5, fontWeight:600, marginBottom:7 },
  input: { background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"11px 14px", color:C.text, fontSize:15, width:"100%", outline:"none", fontFamily:"inherit", marginBottom:12 },
  btn: { width:"100%", padding:14, background:`linear-gradient(135deg,${C.cyan},${C.green})`, border:"none", borderRadius:12, color:"#0A0F14", fontWeight:800, fontSize:15, letterSpacing:1, cursor:"pointer", marginTop:6, fontFamily:"inherit" },
  tip: { background:"rgba(0,212,255,0.07)", border:"1px solid rgba(0,212,255,0.2)", borderRadius:10, padding:"9px 13px", fontSize:12, color:C.cyan, marginBottom:14, lineHeight:1.6 },
};

function CodeBadge({ code }) {
  const map = { C1:{bg:"rgba(255,77,106,0.15)",c:C.danger}, C2:{bg:"rgba(255,176,32,0.15)",c:C.warn}, C3:{bg:"rgba(0,212,255,0.15)",c:C.cyan}, FI:{bg:"rgba(167,139,250,0.15)",c:C.purple} };
  const m = map[code] || map.FI;
  return <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:6, background:m.bg, color:m.c, border:`1px solid ${m.c}40`, flexShrink:0, fontFamily:"monospace" }}>{code}</span>;
}

function BackHeader({ title, onBack }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18, paddingTop:4 }}>
      <button onClick={onBack} style={{ width:36, height:36, borderRadius:10, background:C.surface, border:`1px solid ${C.border}`, color:C.text, fontSize:20, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontFamily:"inherit" }}>‹</button>
      <div style={{ fontSize:20, fontWeight:800, color:C.text }}>{title}</div>
    </div>
  );
}

function ProGate({ onLogin }) {
  return (
    <div style={{ background:`rgba(0,212,255,0.05)`, border:`1px solid rgba(0,212,255,0.2)`, borderRadius:14, padding:24, textAlign:"center", marginTop:8 }}>
      <div style={{ fontSize:28, marginBottom:10 }}>🔒</div>
      <div style={{ fontWeight:800, fontSize:16, color:C.text, marginBottom:6 }}>CircuitFlow Pro Feature</div>
      <div style={{ fontSize:13, color:C.muted, marginBottom:16, lineHeight:1.6 }}>Sign in to access the full 2,500+ observation database, AI suggestions, and advanced regulation search.</div>
      <button onClick={onLogin} style={{ ...st.btn, marginTop:0 }}>SIGN IN TO CIRCUITFLOW</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VOICE CIRCUIT CHART — Data & Helpers
// ═══════════════════════════════════════════════════════════════════════════
const SIMULATED_SPEECHES_VC = [
  "Circuit 1, L1, lighting, Classroom 1, MCB Type B, 6 amp, 1.5mm twin and earth",
  "Circuit 2, L1, lighting, Classroom 2, MCB Type B, 6 amp, tandem, 1.5mm twin and earth",
  "Circuit 3, L2, power sockets, Staff Room, MCB Type B, 20 amp, 2.5mm twin and earth",
  "Circuit 4, L2, power sockets, Classroom 1, MCB Type B, 20 amp, 2.5mm twin and earth, no RCD",
  "Circuit 5, L3, immersion heater, Boiler Room, MCB Type C, 16 amp, 2.5mm twin and earth",
  "Circuit 6, L1, lighting, Corridor, MCB Type B, 6 amp, 1.5mm twin and earth",
  "Circuit 7, L2, power sockets, Classroom 2, MCB Type B, 32 amp, 1.5mm twin and earth",
  "Circuit 8, L3, air conditioning, Server Room, MCB Type C, 20 amp, 2.5mm twin and earth",
  "Circuit 9, L1, emergency lighting, All Areas, MCB Type B, 6 amp, 1.5mm twin and earth",
  "Circuit 10, L2, power sockets, Kitchen, MCB Type B, 20 amp, 2.5mm twin and earth, tandem",
  "Circuit 11, L3, cooker, Kitchen, MCB Type C, 32 amp, 6.0mm twin and earth",
  "Circuit 12, L1, spare, unassigned, MCB Type B, 6 amp",
];

const MAX_ZS_VC = {
  "B6":8.15,"B10":4.89,"B16":3.06,"B20":2.44,"B25":1.96,"B32":1.53,
  "C6":4.07,"C10":2.44,"C16":1.53,"C20":1.22,"C25":0.97,"C32":0.76,
};
const CABLE_ZS_VC = { "1.0":1.83,"1.5":1.22,"2.5":0.73,"4.0":0.46,"6.0":0.31 };

async function parseCircuitVoice(speech) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: `You are a circuit data extraction AI for CircuitFlow (I.S. 10101, Ireland).
Extract circuit details from engineer speech and return ONLY valid JSON (no markdown) with:
circuit_number(int), phase(L1/L2/L3), description(string), location(string),
mcb_type(B/C/D), mcb_rating(int), cable_size(string mm² only e.g."1.5"),
tandem(boolean), rcd_protected(boolean - false only if "no RCD" explicitly stated), notes(string|null)`,
      messages: [{ role: "user", content: `Engineer speech: "${speech}"` }],
    }),
  });
  const data = await response.json();
  const text = data.content?.[0]?.text || "{}";
  try { return JSON.parse(text.replace(/```json|```/g, "").trim()); }
  catch { return null; }
}

function getVCFlags(c) {
  const flags = [];
  const key = `${c.mcb_type}${c.mcb_rating}`;
  const maxZs = MAX_ZS_VC[key];
  const typZs = CABLE_ZS_VC[c.cable_size];
  if (c.tandem) flags.push({ type:"C3", label:"Tandem MCB", detail:"Non-standard arrangement" });
  if (maxZs && typZs && typZs > maxZs) flags.push({ type:"C2", label:"Max Zs exceeded", detail:`Cable ~${typZs}Ω > max ${maxZs}Ω` });
  if (c.rcd_protected === false) flags.push({ type:"C2", label:"No RCD protection", detail:"Reg 411.3.3 / 5.3.2" });
  return flags;
}

// ═══════════════════════════════════════════════════════════════════════════
// VOICE CHART SCREEN
// ═══════════════════════════════════════════════════════════════════════════
function VoiceChartScreen({ onBack, onViewReports }) {
  const [circuits, setCircuits] = useState([]);
  const [simIndex, setSimIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [lastSpeech, setLastSpeech] = useState("");
  const [activeCircuit, setActiveCircuit] = useState(null);
  const [log, setLog] = useState([]);
  const [view, setView] = useState("phone");

  const addLog = (msg) => setLog(prev => [`${new Date().toLocaleTimeString()} — ${msg}`, ...prev.slice(0,5)]);

  const handleSpeak = async () => {
    if (isListening || isParsing) return;
    const speech = SIMULATED_SPEECHES_VC[simIndex % SIMULATED_SPEECHES_VC.length];
    setSimIndex(i => i + 1);
    setIsListening(true);
    setLastSpeech("");
    addLog("🎤 Listening...");
    await new Promise(r => setTimeout(r, 1600));
    setLastSpeech(speech);
    setIsListening(false);
    setIsParsing(true);
    addLog(`📝 Parsing circuit ${simIndex + 1}...`);
    const parsed = await parseCircuitVoice(speech);
    setIsParsing(false);
    if (parsed?.circuit_number) {
      const flags = getVCFlags(parsed);
      const newC = { ...parsed, flags, id: Date.now() };
      setCircuits(prev => {
        const idx = prev.findIndex(c => c.circuit_number === parsed.circuit_number);
        if (idx >= 0) { const u = [...prev]; u[idx] = newC; return u; }
        return [...prev, newC].sort((a,b) => a.circuit_number - b.circuit_number);
      });
      setActiveCircuit(newC.circuit_number);
      addLog(`⚡ Circuit ${parsed.circuit_number} — ${flags.length ? `⚠️ ${flags.length} flag(s)` : "✅ Clean"}`);
      setTimeout(() => setActiveCircuit(null), 2000);
    } else {
      addLog("❌ Parse failed — try again");
    }
  };

  const totalFlags = circuits.reduce((s,c) => s + (c.flags?.length||0), 0);
  const observations = circuits.flatMap(c => (c.flags||[]).map(f => ({ ...f, circuit: c.circuit_number, location: c.location })));
  const phaseColor = (p) => ({ L1:"#00D4FF", L2:"#A78BFA", L3:"#FFB020" }[p] || "#5a7a9a");
  const codeCol = (code) => {
    if (code==="C1") return { bg:"rgba(255,77,106,0.15)",c:"#FF4D6A",border:"rgba(255,77,106,0.4)" };
    if (code==="C2") return { bg:"rgba(255,176,32,0.15)",c:"#FFB020",border:"rgba(255,176,32,0.4)" };
    return { bg:"rgba(0,212,255,0.15)",c:"#00D4FF",border:"rgba(0,212,255,0.4)" };
  };

  return (
    <div style={st.screen}>
      <BackHeader title="Voice DB Chart" onBack={onBack} />
      <div style={st.seg}>
        <button style={st.segB(view==="phone")} onClick={() => setView("phone")}>📱 Voice Input</button>
        <button style={st.segB(view==="chart")} onClick={() => setView("chart")}>
          📋 Chart {circuits.length > 0 ? `(${circuits.length})` : ""}
        </button>
      </div>

      {view === "phone" && (
        <>
          <div style={st.tip}>🎤 Engineer speaks each circuit on site. Claude parses live and the chart populates in real time.</div>
          <div style={{ ...st.card, display:"flex", flexDirection:"column", alignItems:"center", gap:16, padding:24 }}>
            <button
              onClick={handleSpeak}
              disabled={isListening || isParsing}
              style={{
                width:100, height:100, borderRadius:"50%", border:"none",
                cursor: isListening||isParsing ? "default" : "pointer",
                fontSize:36, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                background: isParsing ? `linear-gradient(135deg,#A78BFA,#00D4FF)` : `linear-gradient(135deg,#00D4FF,#00FF88)`,
                boxShadow: isListening ? "0 0 30px rgba(0,212,255,0.5)" : "0 4px 20px rgba(0,212,255,0.2)",
                transform: isListening ? "scale(1.1)" : "scale(1)",
                transition:"all 0.2s",
              }}
            >
              {isParsing ? "🧠" : "🎤"}
              <div style={{ fontSize:10, fontWeight:700, color:"#0A0F14", marginTop:4 }}>
                {isListening ? "Listening..." : isParsing ? "Parsing..." : `Circuit ${simIndex+1}`}
              </div>
            </button>
            <div style={{ fontSize:12, color:C.muted, textAlign:"center" }}>
              {isListening ? "Speaking — capturing engineer input..."
               : isParsing ? "Claude is extracting circuit data..."
               : "Tap to speak next circuit"}
            </div>
          </div>

          {lastSpeech && (
            <div style={st.card}>
              <div style={{ fontSize:11, color:C.muted, marginBottom:6 }}>Last transcript</div>
              <div style={{ fontSize:13, color:C.text, lineHeight:1.6, fontStyle:"italic" }}>"{lastSpeech}"</div>
            </div>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:10 }}>
            {[
              ["Circuits", circuits.length, C.cyan],
              ["Flags", totalFlags, totalFlags > 0 ? C.warn : C.green],
              ["Remaining", Math.max(0, 12 - circuits.length), C.muted],
            ].map(([l,v,col]) => (
              <div key={l} style={{ ...st.card, textAlign:"center", marginBottom:0 }}>
                <div style={{ fontSize:24, fontWeight:800, color:col }}>{v}</div>
                <div style={{ fontSize:11, color:C.muted }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={st.card}>
            <div style={{ ...st.label, marginBottom:8 }}>Activity</div>
            {log.length === 0
              ? <div style={{ fontSize:12, color:C.muted }}>No activity yet — tap mic to start</div>
              : log.map((entry,i) => (
                <div key={i} style={{ fontSize:12, color:i===0?C.cyan:C.muted, marginBottom:3 }}>{entry}</div>
              ))
            }
          </div>

          {onViewReports && (
            <button onClick={onViewReports} style={{ ...st.btn, background:`linear-gradient(135deg,#00D4FF,#00FF88)`, marginTop:4 }}>
              📊 VIEW REPORTS DASHBOARD →
            </button>
          )}
        </>
      )}

      {view === "chart" && (
        <>
          {circuits.length === 0 ? (
            <div style={{ ...st.card, textAlign:"center", padding:32 }}>
              <div style={{ fontSize:32, marginBottom:10 }}>📋</div>
              <div style={{ color:C.muted, fontSize:13 }}>No circuits yet — use Voice Input tab to populate</div>
              <button style={{ ...st.btn, marginTop:16 }} onClick={() => setView("phone")}>← Go to Voice Input</button>
            </div>
          ) : (
            <>
              {(() => {
                const count = { L1:0,L2:0,L3:0 };
                circuits.forEach(c => { if(c.phase) count[c.phase]=(count[c.phase]||0)+1; });
                const vals = Object.values(count).filter(v=>v>0);
                return vals.length>1 && Math.max(...vals)-Math.min(...vals)>2 ? (
                  <div style={{ background:"rgba(255,176,32,0.1)",border:"1px solid rgba(255,176,32,0.3)",borderRadius:10,padding:"10px 14px",marginBottom:10,fontSize:12,color:C.warn }}>
                    ⚠️ Phase imbalance — L1:{count.L1} L2:{count.L2} L3:{count.L3}
                  </div>
                ) : null;
              })()}

              <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:10 }}>
                {circuits.map(c => (
                  <div key={c.id} style={{
                    ...st.card, marginBottom:0,
                    borderColor: activeCircuit===c.circuit_number ? C.cyan : c.flags?.length>0 ? "rgba(255,176,32,0.3)" : C.border,
                    background: activeCircuit===c.circuit_number ? "rgba(0,212,255,0.05)" : C.surface,
                    transition:"all 0.3s"
                  }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <span style={{ fontWeight:800, color:C.text, fontFamily:"monospace", minWidth:24 }}>#{c.circuit_number}</span>
                      <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:20, background:`${phaseColor(c.phase)}20`, color:phaseColor(c.phase) }}>{c.phase}</span>
                      <span style={{ fontSize:13, color:C.text, flex:1 }}>{c.description}</span>
                      {c.tandem && <span style={{ fontSize:10, color:C.warn, background:"rgba(255,176,32,0.1)", padding:"2px 6px", borderRadius:10 }}>Tandem</span>}
                    </div>
                    <div style={{ display:"flex", gap:12, fontSize:11, color:C.muted, marginBottom:c.flags?.length>0?6:0 }}>
                      <span>{c.location}</span>
                      <span>Type {c.mcb_type} {c.mcb_rating}A</span>
                      {c.cable_size && <span>{c.cable_size}mm²</span>}
                    </div>
                    {c.flags?.length>0 && (
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        {c.flags.map((f,i) => {
                          const col = codeCol(f.type);
                          return <span key={i} style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:6, background:col.bg, color:col.c, border:`1px solid ${col.border}` }}>{f.type} · {f.label}</span>;
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {observations.length > 0 && (
                <div style={st.card}>
                  <div style={{ ...st.label, marginBottom:10 }}>Auto Observations ({observations.length})</div>
                  {observations.map((obs,i) => {
                    const col = codeCol(obs.type);
                    return (
                      <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", padding:"8px 0", borderTop:`1px solid ${C.border}` }}>
                        <span style={{ fontSize:11, fontWeight:700, padding:"3px 8px", borderRadius:6, background:col.bg, color:col.c, border:`1px solid ${col.border}`, flexShrink:0 }}>{obs.type}</span>
                        <div>
                          <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{obs.label}</div>
                          <div style={{ fontSize:11, color:C.muted }}>{obs.detail} · Circuit {obs.circuit} · {obs.location}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {onViewReports && (
            <button onClick={onViewReports} style={{ ...st.btn, background:`linear-gradient(135deg,#00D4FF,#00FF88)`, marginTop:4 }}>
              📊 VIEW REPORTS DASHBOARD →
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREENS
// ═══════════════════════════════════════════════════════════════════════════

function HomeScreen({ navigate, isLoggedIn }) {
  const tools = [
    { id:"zs",         icon:"📊", label:"Zs Calculator",      desc:"Max Zs pass/fail",     color:C.cyan,   pro:false },
    { id:"obs",        icon:"⚠️", label:"Observation Lookup", desc:"C1 / C2 / C3 / FI",   color:C.warn,   pro:false },
    { id:"rcd",        icon:"🧪", label:"RCD Test Times",     desc:"Trip time limits",      color:C.green,  pro:false },
    { id:"locations",  icon:"🏠", label:"Special Locations",  desc:"Part 7 quick guide",   color:C.purple, pro:false },
    { id:"checklist",  icon:"✅", label:"Checklists",         desc:"DB · Socket · EICR",   color:C.teal,   pro:false },
    { id:"voicechart", icon:"🎤", label:"Voice DB Chart",     desc:"Speak circuits live",  color:C.cyan,   pro:false },
    { id:"regs",       icon:"📚", label:"Regulation Search",  desc:"I.S. 10101 lookup",    color:C.danger, pro:false },
  ];
  return (
    <div style={st.screen}>
      <div style={st.tip}>⚡ Works offline — all tools available without signal.</div>
      <div style={{ fontSize:12, color:C.muted, textTransform:"uppercase", letterSpacing:1.5, fontWeight:600, marginBottom:12 }}>Field Tools</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
        {tools.map(t => (
          <div key={t.id} onClick={() => navigate(t.id)}
            style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:"16px 14px", cursor:"pointer", borderTop:`2px solid ${t.color}`, transition:"transform 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.transform="translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform="none"}
          >
            <div style={{ fontSize:26, marginBottom:10 }}>{t.icon}</div>
            <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:3 }}>{t.label}</div>
            <div style={{ fontSize:11, color:C.muted }}>{t.desc}</div>
          </div>
        ))}
      </div>
      {!isLoggedIn && (
        <div style={{ background:C.surface, border:`1px solid rgba(0,212,255,0.25)`, borderRadius:14, padding:"14px 16px", display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontSize:22 }}>⚡</span>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:14, color:C.text }}>Full CircuitFlow Platform</div>
            <div style={{ fontSize:11, color:C.muted }}>Certificates · AI Observations · Reports</div>
          </div>
          <span style={{ color:C.cyan, fontSize:20 }}>›</span>
        </div>
      )}
    </div>
  );
}

function ZsScreen({ onBack }) {
  const [device, setDevice] = useState("MCB");
  const [curve, setCurve] = useState("B");
  const [rating, setRating] = useState("");
  const [measured, setMeasured] = useState("");
  const [result, setResult] = useState(null);

  const deviceTable = ZS[device] || ZS.MCB;
  const hasCurve = device !== "Fuse_BS88" && device !== "Fuse_BS1361";
  const curveKey = hasCurve ? curve : "_";
  const ratingTable = (deviceTable[curveKey] || deviceTable["_"]) ?? {};
  const availableRatings = Object.keys(ratingTable).map(Number).sort((a,b)=>a-b);

  function calculate() {
    const r = parseFloat(rating);
    const zs = parseFloat(measured);
    if (!r || !zs) return;
    const maxZs = ratingTable[r];
    if (!maxZs) return;
    const pass = zs <= maxZs;
    const margin = ((maxZs - zs) / maxZs * 100);
    setResult({ maxZs, zs, pass, margin, r, device, curve:hasCurve?curve:null });
  }

  const deviceLabels = { MCB:"MCB", RCBO:"RCBO", Fuse_BS88:"Fuse BS88", Fuse_BS1361:"Fuse BS1361" };

  return (
    <div style={st.screen}>
      <BackHeader title="Zs Calculator" onBack={onBack} />
      <div style={st.tip}>💡 I.S. 10101 — 100% rule applied. BS 7671 coming soon.</div>
      <div style={st.label}>Device Type</div>
      <div style={st.seg}>
        {Object.keys(ZS).map(d => <button key={d} style={st.segB(device===d)} onClick={() => { setDevice(d); setRating(""); setResult(null); }}>{deviceLabels[d]}</button>)}
      </div>
      {hasCurve && <>
        <div style={st.label}>Curve</div>
        <div style={st.seg}>
          {["B","C","D"].map(v => <button key={v} style={st.segB(curve===v)} onClick={() => { setCurve(v); setRating(""); setResult(null); }}>Type {v}</button>)}
        </div>
      </>}
      <div style={st.label}>Rating (A)</div>
      <div style={{ ...st.seg, flexWrap:"wrap", height:"auto", gap:4 }}>
        {availableRatings.map(r => (
          <button key={r} style={{ ...st.segB(rating==r), flex:"none", minWidth:44, padding:"7px 10px" }} onClick={() => setRating(r)}>{r}A</button>
        ))}
      </div>
      <div style={st.label}>Measured Zs (Ω)</div>
      <input style={st.input} type="number" step="0.01" placeholder="e.g. 1.47" value={measured} onChange={e => setMeasured(e.target.value)} />
      <button style={st.btn} onClick={calculate}>CALCULATE</button>
      {result && (
        <div style={{ ...st.card, marginTop:16, borderColor: result.pass?"rgba(0,255,136,0.3)":"rgba(255,77,106,0.3)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ fontSize:26, fontWeight:800, padding:"6px 16px", borderRadius:8,
              background: result.pass?"rgba(0,255,136,0.12)":"rgba(255,77,106,0.12)",
              color: result.pass?C.green:C.danger,
              border:`1px solid ${result.pass?"rgba(0,255,136,0.3)":"rgba(255,77,106,0.3)"}`
            }}>{result.pass?"✓ PASS":"✗ FAIL"}</div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:11, color:C.muted, letterSpacing:1, marginBottom:3 }}>MARGIN</div>
              <div style={{ fontSize:26, fontWeight:800, fontFamily:"monospace", color:result.pass?C.green:C.danger }}>
                {result.pass?"+":""}{result.margin.toFixed(1)}%
              </div>
            </div>
          </div>
          {[
            ["Max Zs (table)", result.maxZs.toFixed(3)+" Ω"],
            ["Applied limit", result.maxZs.toFixed(3)+" Ω (100%)"],
            ["Measured Zs", result.zs.toFixed(2)+" Ω"],
            ["Device", `${deviceLabels[result.device]}${result.curve?" Type "+result.curve:""} — ${result.r}A`],
            ["Standard", "I.S. 10101:2020+A1:2024"],
            ["Regulation", "411.4.4"],
          ].map(([k,v]) => (
            <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${C.border}` }}>
              <span style={{ fontSize:13, color:C.muted }}>{k}</span>
              <span style={{ fontSize:13, fontFamily:"monospace", fontWeight:700, color:k==="Regulation"||k==="Standard"?C.cyan:C.text }}>{v}</span>
            </div>
          ))}
          <div style={{ marginTop:12, padding:"10px 12px", background:"rgba(0,212,255,0.05)", borderRadius:8, fontSize:12, color:C.muted, lineHeight:1.6 }}>
            ⚠️ Always verify Zs with a calibrated instrument. This calculator is a reference tool — the inspector is responsible for all compliance decisions.
          </div>
        </div>
      )}
    </div>
  );
}

function ObsScreen({ onBack, isLoggedIn, onLogin }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const visibleObs = isLoggedIn ? OBSERVATIONS : OBSERVATIONS.filter(o => !o.proOnly);
  const filtered = visibleObs.filter(o => {
    const matchCode = filter==="All" || o.code===filter;
    const matchQ = !query || o.title.toLowerCase().includes(query.toLowerCase()) || o.desc.toLowerCase().includes(query.toLowerCase()) || o.reg.includes(query) || o.section.toLowerCase().includes(query.toLowerCase());
    return matchCode && matchQ;
  });
  return (
    <div style={st.screen}>
      <BackHeader title="Observation Lookup" onBack={onBack} />
      <input style={st.input} placeholder="Describe what you see on site…" value={query} onChange={e => setQuery(e.target.value)} />
      <div style={st.seg}>
        {["All","C1","C2","C3","FI"].map(c => <button key={c} style={st.segB(filter===c)} onClick={() => setFilter(c)}>{c}</button>)}
      </div>
      {filtered.length===0 && <div style={{ color:C.muted, fontSize:13, textAlign:"center", padding:24 }}>No matching observations</div>}
      {filtered.map(o => (
        <div key={o.id} style={st.card}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:7, gap:10 }}>
            <div style={{ fontWeight:700, fontSize:14, lineHeight:1.3, flex:1, color:C.text }}>{o.title}</div>
            <CodeBadge code={o.code} />
          </div>
          <div style={{ fontSize:11, color:C.cyan, fontFamily:"monospace", marginBottom:6 }}>Reg {o.reg} · {o.section}</div>
          <div style={{ fontSize:13, color:"#7a9ab8", lineHeight:1.5 }}>{o.desc}</div>
        </div>
      ))}
      {!isLoggedIn && <ProGate onLogin={onLogin} />}
    </div>
  );
}

function RcdScreen({ onBack }) {
  return (
    <div style={st.screen}>
      <BackHeader title="RCD Test Times" onBack={onBack} />
      <div style={st.tip}>💡 Always test at ½×IΔn first — no trip expected. Use calibrated test instrument only.</div>
      {RCD_TYPES.map(rcd => (
        <div key={rcd.label} style={{ ...st.card, marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <span style={{ fontSize:16 }}>{rcd.icon}</span>
            <div style={{ fontWeight:700, fontSize:15, color:rcd.color }}>{rcd.label}</div>
          </div>
          <div style={{ fontSize:12, color:C.muted, marginBottom:12 }}>{rcd.note}</div>
          {rcd.rows.map(row => (
            <div key={row.test} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderTop:`1px solid ${C.border}` }}>
              <span style={{ fontSize:12, color:C.muted, fontFamily:"monospace" }}>{row.test}</span>
              <span style={{ fontSize:14, fontWeight:700, fontFamily:"monospace", color:row.hi?rcd.color:C.muted }}>{row.limit}</span>
            </div>
          ))}
        </div>
      ))}
      <div style={{ background:"rgba(0,212,255,0.05)", border:"1px solid rgba(0,212,255,0.15)", borderRadius:10, padding:12, fontSize:12, color:C.muted, lineHeight:1.7 }}>
        <strong style={{ color:C.cyan }}>Regulation:</strong> I.S. 10101 / Table 41.1<br/>
        <strong style={{ color:C.cyan }}>Type B note:</strong> Required for EV charging, solar PV inverters and variable speed drives.
      </div>
    </div>
  );
}

function LocationsScreen({ onBack, isLoggedIn, onLogin }) {
  const [selected, setSelected] = useState(null);
  if (selected !== null) {
    const loc = LOCATIONS[selected];
    return (
      <div style={st.screen}>
        <BackHeader title={loc.name} onBack={() => setSelected(null)} />
        <div style={{ fontSize:12, color:C.muted, fontFamily:"monospace", marginBottom:16 }}>{loc.ref}</div>
        {loc.items.map(item => (
          <div key={item.label} style={{ ...st.card, marginBottom:8 }}>
            <div style={{ fontSize:11, color:loc.color, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:5 }}>{item.label}</div>
            <div style={{ fontSize:13, color:C.text, lineHeight:1.6 }}>{item.value}</div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={st.screen}>
      <BackHeader title="Special Locations" onBack={onBack} />
      <div style={st.tip}>💡 Tap a location for zones, IP ratings, RCD and bonding requirements.</div>
      {LOCATIONS.map((loc, i) => {
        const locked = loc.proOnly && !isLoggedIn;
        return (
          <div key={loc.name} onClick={() => locked ? onLogin() : setSelected(i)}
            style={{ ...st.card, display:"flex", alignItems:"center", gap:14, cursor:"pointer", marginBottom:8, opacity:locked?0.7:1 }}
            onMouseEnter={e => e.currentTarget.style.borderColor=loc.color}
            onMouseLeave={e => e.currentTarget.style.borderColor=C.border}
          >
            <span style={{ fontSize:24 }}>{loc.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:15, color:C.text }}>{loc.name}</div>
              <div style={{ fontSize:12, color:C.muted, fontFamily:"monospace" }}>{loc.ref}</div>
            </div>
            <span style={{ color:C.muted, fontSize:20 }}>{locked?"🔒":"›"}</span>
          </div>
        );
      })}
    </div>
  );
}

function ChecklistScreen({ onBack }) {
  const [type, setType] = useState("db");
  const [checked, setChecked] = useState({});
  const list = CHECKLISTS[type];
  const done = list.items.filter((_,i) => checked[type+i]).length;
  const pct = Math.round(done / list.items.length * 100);
  function toggle(i) { setChecked(p => ({ ...p, [type+i]: !p[type+i] })); }
  function reset() {
    const n = { ...checked };
    list.items.forEach((_,i) => delete n[type+i]);
    setChecked(n);
  }
  return (
    <div style={st.screen}>
      <BackHeader title="Inspection Checklist" onBack={onBack} />
      <div style={st.seg}>
        {Object.entries(CHECKLISTS).map(([k,v]) => <button key={k} style={st.segB(type===k)} onClick={() => setType(k)}>{v.label}</button>)}
      </div>
      <div style={{ background:C.surface, borderRadius:10, height:8, overflow:"hidden", marginBottom:6 }}>
        <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${C.cyan},${C.green})`, borderRadius:10, transition:"width 0.3s" }} />
      </div>
      <div style={{ textAlign:"right", fontSize:11, color:C.muted, marginBottom:14, fontFamily:"monospace" }}>{done} / {list.items.length}</div>
      {list.items.map((item,i) => {
        const ticked = !!checked[type+i];
        return (
          <div key={i} onClick={() => toggle(i)} style={{ background:ticked?"rgba(0,255,136,0.04)":C.surface, border:`1px solid ${ticked?"rgba(0,255,136,0.3)":C.border}`, borderRadius:10, padding:"13px 14px", display:"flex", alignItems:"center", gap:14, cursor:"pointer", marginBottom:6, transition:"all 0.15s" }}>
            <div style={{ width:22, height:22, borderRadius:6, border:`2px solid ${ticked?C.green:C.border}`, background:ticked?C.green:"transparent", display:"flex", alignItems:"center", justifyContent:"center", color:"#0A0F14", fontSize:13, fontWeight:700, flexShrink:0, transition:"all 0.15s" }}>{ticked?"✓":""}</div>
            <span style={{ fontSize:13, color:ticked?C.muted:C.text, textDecoration:ticked?"line-through":"none" }}>{item}</span>
          </div>
        );
      })}
      <button style={st.btn} onClick={reset}>RESET</button>
    </div>
  );
}

function RegsScreen({ onBack, isLoggedIn, onLogin }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const filtered = REGULATIONS.filter(r =>
    !query || r.title.toLowerCase().includes(query.toLowerCase()) || r.body.toLowerCase().includes(query.toLowerCase()) || r.num.includes(query)
  );
  if (selected !== null) {
    const reg = selected;
    return (
      <div style={st.screen}>
        <BackHeader title="Regulation" onBack={() => setSelected(null)} />
        <div style={{ ...st.card }}>
          <div style={{ fontSize:12, color:C.cyan, fontFamily:"monospace", marginBottom:6 }}>I.S. 10101 — Regulation {reg.num}</div>
          <div style={{ fontSize:19, fontWeight:800, color:C.text, marginBottom:14, lineHeight:1.3 }}>{reg.title}</div>
          <div style={{ fontSize:14, color:C.text, lineHeight:1.8 }}>{reg.body}</div>
        </div>
        <div style={st.tip}>For the complete regulation text, refer to I.S. 10101:2020+A1:2024.</div>
      </div>
    );
  }
  return (
    <div style={st.screen}>
      <BackHeader title="Regulation Search" onBack={onBack} />
      <input style={st.input} placeholder="e.g. bonding, socket, RCD, SPD…" value={query} onChange={e => setQuery(e.target.value)} />
      {filtered.length===0 && <div style={{ color:C.muted, fontSize:13, textAlign:"center", padding:24 }}>No matching regulations</div>}
      {filtered.map(r => (
        <div key={r.num} onClick={() => setSelected(r)}
          style={{ ...st.card, cursor:"pointer", marginBottom:8 }}
          onMouseEnter={e => e.currentTarget.style.borderColor=C.cyan}
          onMouseLeave={e => e.currentTarget.style.borderColor=C.border}
        >
          <div style={{ fontSize:11, color:C.cyan, fontFamily:"monospace", marginBottom:4 }}>Reg {r.num}</div>
          <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:5 }}>{r.title}</div>
          <div style={{ fontSize:12, color:C.muted, lineHeight:1.5 }}>{r.body.substring(0,100)}…</div>
        </div>
      ))}
      {!isLoggedIn && <ProGate onLogin={onLogin} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// APP SHELL
// ═══════════════════════════════════════════════════════════════════════════
const NAV = [
  { id:"home",  icon:"⚡", label:"Home"    },
  { id:"zs",    icon:"📊", label:"Zs Calc" },
  { id:"obs",   icon:"⚠️", label:"Obs"     },
  { id:"regs",  icon:"📚", label:"Regs"    },
];

export default function CompanionApp({ isLoggedIn = false, onLogin = () => {}, onViewReports = null }) {
  const [screen, setScreen] = useState("home");
  const nav = id => setScreen(id);
  const home = () => setScreen("home");
  const activeNav = NAV.find(n => n.id === screen) ? screen : "home";

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/companion-sw.js").catch(() => {});
    }
  }, []);

  const sharedProps = { isLoggedIn, onLogin, onBack: home };

  return (
    <div style={{ background:C.bg, height:"100vh", display:"flex", flexDirection:"column", fontFamily:"'Segoe UI', system-ui, sans-serif", color:C.text, overflow:"hidden", maxWidth:520, margin:"0 auto" }}>

      {/* HEADER */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"12px 18px 10px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, background:`linear-gradient(135deg,${C.cyan},${C.green})`, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 }}>⚡</div>
          <div>
            <div style={{ fontSize:18, fontWeight:800, letterSpacing:-0.5 }}>
              <span style={{ color:C.text }}>Circuit</span>
              <span style={{ background:`linear-gradient(90deg,${C.cyan},${C.green})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Flow</span>
            </div>
            <div style={{ fontSize:9, color:C.muted, letterSpacing:2, textTransform:"uppercase" }}>Regulation Companion · I.S. 10101</div>
          </div>
          {isLoggedIn && <div style={{ marginLeft:"auto", fontSize:11, color:C.green, background:"rgba(0,255,136,0.1)", padding:"3px 10px", borderRadius:20, border:"1px solid rgba(0,255,136,0.25)" }}>PRO</div>}
        </div>
      </div>

      {/* BODY */}
      <div style={{ flex:1, overflowY:"auto", padding:"16px 16px 0" }}>
        {screen==="home"       && <HomeScreen navigate={nav} isLoggedIn={isLoggedIn} />}
        {screen==="zs"         && <ZsScreen {...sharedProps} />}
        {screen==="obs"        && <ObsScreen {...sharedProps} />}
        {screen==="rcd"        && <RcdScreen {...sharedProps} />}
        {screen==="locations"  && <LocationsScreen {...sharedProps} />}
        {screen==="checklist"  && <ChecklistScreen {...sharedProps} />}
        {screen==="voicechart" && <VoiceChartScreen onBack={home} onViewReports={onViewReports} />}
        {screen==="regs"       && <RegsScreen {...sharedProps} />}
      </div>

      {/* BOTTOM NAV */}
      <div style={{ background:C.surface, borderTop:`1px solid ${C.border}`, display:"flex", flexShrink:0, paddingBottom:8 }}>
        {NAV.map(item => (
          <div key={item.id} onClick={() => nav(item.id)}
            style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"8px 4px 4px", cursor:"pointer",
              color:activeNav===item.id?C.cyan:C.muted, fontSize:10, fontWeight:activeNav===item.id?700:400,
              borderTop:activeNav===item.id?`2px solid ${C.cyan}`:"2px solid transparent", transition:"all 0.15s" }}>
            <span style={{ fontSize:20 }}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
