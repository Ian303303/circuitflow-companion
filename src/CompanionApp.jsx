/**
 * CircuitFlow Regulation Companion — Standalone App
 * Deployed at: https://circuitflow-companion.vercel.app
 *
 * To add to your main CircuitFlow app as a tab/route:
 *   import CompanionApp from './companion/CompanionApp'
 *   <CompanionApp isLoggedIn={session !== null} onLogin={() => navigate('/login')} />
 */

import { useState, useEffect, useCallback } from "react";

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
const OBSERVATIONS = [
  { id:"OB0001", title:"Service head has black pitch/tar residue leaking from cable entry/side seals", code:"C3", reg:"I.S. 10101", section:"Origin", desc:"Service head has black pitch/tar residue leaking from cable entry/side seals or shows signs of leakage", proOnly:false },
  { id:"OB0002", title:"Lead sheath of the service cable split/damaged. No exposed live parts", code:"C3", reg:"I.S. 10101", section:"Origin", desc:"Lead sheath of the service cable split/damaged. No exposed live parts", proOnly:false },
  { id:"OB0003", title:"Service cable not adequately supported", code:"C3", reg:"I.S. 10101", section:"Origin", desc:"Service cable not adequately supported", proOnly:false },
  { id:"OB0004", title:"Service cut out has been damaged — exposed live parts", code:"C1", reg:"I.S. 10101", section:"Origin", desc:"Service cut out has been damaged — exposed live parts", proOnly:false },
  { id:"OB0005", title:"Service cut out has been damaged", code:"C3", reg:"ESQCR", section:"Origin", desc:"Service cut out has been damaged", proOnly:false },
  { id:"OB0006", title:"Incorrect connection of earthing conductor to TN-S earthing system", code:"C3", reg:"I.S. 10101", section:"Origin", desc:"Incorrect connection of earthing conductor to TN-S earthing system", proOnly:false },
  { id:"OB0007", title:"Service cut out fuse carrier seal not in place and properly secured", code:"C3", reg:"I.S. 10101", section:"Origin", desc:"Service cut out fuse carrier seal not in place and properly secured", proOnly:false },
  { id:"OB0008", title:"Neutral connection has exposed parts", code:"C3", reg:"I.S. 10101", section:"Origin", desc:"Neutral connection has exposed parts", proOnly:false },
  { id:"OB0009", title:"Metering equipment has been damaged", code:"C3", reg:"I.S. 10101", section:"Origin", desc:"Metering equipment has been damaged", proOnly:false },
  { id:"OB0010", title:"No earth bar inside the distribution board. No circuit protective conductors from final circuits", code:"C2", reg:"543.2", section:"Earthing", desc:"There is no earth bar inside the distribution board. No circuit protective conductors from final circuits", proOnly:false },
  { id:"OB0011", title:"No earth bar inside the distribution board. CPCs could come loose", code:"C2", reg:"543.2", section:"Earthing", desc:"There is no earth bar inside the distribution board. Circuit protective conductors are terminated to a common bolt and could potentially come loose", proOnly:false },
  { id:"OB0012", title:"No main protective bonding conductor present to main incoming service", code:"C2", reg:"411.3.1.2", section:"Earthing", desc:"No main protective bonding conductor present to main incoming service", proOnly:false },
  { id:"OB0013", title:"Unable to verify main protective bonding conductor at main incoming service", code:"C3", reg:"411.3.1.2", section:"Earthing", desc:"Unable to locate and verify the main protective bonding conductor is present at the main incoming service", proOnly:false },
  { id:"OB0014", title:"Zs reading higher than 80% of Table 41.3 (MCBs)", code:"C2", reg:"411.3.3", section:"Earthing", desc:"Zs reading higher than 80% of that tabulated in Table 41.3 (MCBs)", proOnly:false },
  { id:"OB0015", title:"Zs reading higher than 80% of Table 41.2 (fuses 0.4 second)", code:"C2", reg:"411.3.3", section:"Earthing", desc:"Zs reading higher than 80% of that tabulated in Table 41.2 (fuses 0.4 second)", proOnly:false },
  { id:"OB0016", title:"Zs reading higher than 80% of Table 41.4 (fuses 5 second)", code:"C2", reg:"411.3.3", section:"Earthing", desc:"Zs reading higher than 80% of that tabulated in Table 41.4 (fuses 5 second)", proOnly:false },
  { id:"OB0017", title:"No flying leads from SWA earth rings to earth bar", code:"C3", reg:"543.2.7", section:"Earthing", desc:"There are no flying leads from SWA earth rings to the earth bar of the distribution board. Earth continuity is electrically sound", proOnly:false },
  { id:"OB0018", title:"Incorrect type of earth clamp on sub-main/final circuit sheath", code:"C2", reg:"522.8.1", section:"Earthing", desc:"Incorrect type of earth clamp connected around the sheath of the sub-main/final circuit", proOnly:false },
  { id:"OB0019", title:"Undersized main protective bonding conductor — above minimum but non-compliant", code:"C4", reg:"544.1.1", section:"Earthing", desc:"Undersized main protective bonding conductor. Size is above the minimum of 6mm but still does not meet the regulation requirement", proOnly:false },
  { id:"OB0020", title:"Undersized main protective bonding conductor — below minimum 6mm", code:"C2", reg:"544.1.1", section:"Earthing", desc:"Undersized main protective bonding conductor. Size is below the minimum of 6mm (TN-S/TT) or 10mm (TN-C-S)", proOnly:false },
  { id:"OB0021", title:"Undersized main earth conductor for TT/TN-S arrangement", code:"C2", reg:"543.1.4, Table 54.7", section:"Earthing", desc:"Undersized main earth conductor for a TT/TN-S earthing arrangement", proOnly:false },
  { id:"OB0022", title:"Undersized main earth conductor for TN-C-S (PME) arrangement", code:"C2", reg:"543.1.4", section:"Earthing", desc:"Undersized main earth conductor for a TN-C-S (PME) earthing arrangement", proOnly:false },
  { id:"OB0023", title:"Backup generator does not have its own earth electrode", code:"C2", reg:"551.4.3.2", section:"Earthing", desc:"The backup generator does not have its own earth electrode", proOnly:false },
  { id:"OB0032", title:"A CPC must be terminated at every accessory", code:"C2", reg:"411.3.1.1", section:"Earthing", desc:"A CPC must be terminated at every accessory", proOnly:false },
  { id:"OB0033", title:"No continuity of protective conductor", code:"C2", reg:"643.2, 411.3.1.1", section:"Earthing", desc:"No continuity of protective conductor", proOnly:false },
  { id:"OB0034", title:"Earth electrode resistance approaching 200 ohm unstable threshold", code:"C3", reg:"411.5.3", section:"Earthing", desc:"Earth electrode resistance should be as low as possible. Result obtained is approaching the 200 ohm value above which it is considered unstable", proOnly:false },
  { id:"OB0035", title:"Earth electrode resistance greater than 200 ohm — unstable", code:"C2", reg:"411.5.3", section:"Earthing", desc:"Earth electrode resistance should be as low as possible. Result obtained is greater than the 200 ohm value", proOnly:false },
  { id:"OB0037", title:"Over-rated overcurrent protective device for connected cables", code:"C2", reg:"433.1.1", section:"Protection", desc:"Over-rated overcurrent protective device in relation to the current-carrying capacity of the connected cables", proOnly:false },
  { id:"OB0039", title:"Over-rated BS 3036 fuse wire", code:"C2", reg:"433.1", section:"Protection", desc:"Over-rated BS 3036 fuse wire", proOnly:false },
  { id:"OB0043", title:"Multiple circuits in the overcurrent protective device", code:"C3", reg:"314.4, 521.8.2", section:"Protection", desc:"Multiple circuits in the overcurrent protective device", proOnly:false },
  { id:"OB0054", title:"No overvoltage protection — installation pre-2022", code:"C4", reg:"534.4.1", section:"Protection", desc:"This installation was designed and installed prior to 2022. There is no evidence of overvoltage protection. Type 1/Type 2 surge protective devices are recommended", proOnly:false },
  { id:"OB0055", title:"No overvoltage protection — installation post-2022", code:"C3", reg:"534.4.1", section:"Protection", desc:"This installation was designed and installed after 2022. There is no evidence of overvoltage protection. SPDs should be installed", proOnly:false },
  { id:"OB0056", title:"No AFDD installed — Higher Risk Residential Building", code:"C4", reg:"421.7", section:"Protection", desc:"Arc fault detection devices (AFDD) conforming to BS EN 62606 have not been provided for single-phase AC final circuits supplying socket-outlets rated not exceeding 32A in HRRBs, HMOs, student accommodation and care homes", proOnly:false },
  { id:"OB0057", title:"AFDD recommended for other premises", code:"C3", reg:"421.7", section:"Protection", desc:"It is recommended that arc fault detection devices (AFDD) be provided for single-phase AC final circuits supplying socket-outlets rated not exceeding 32A", proOnly:false },
  { id:"OB0058", title:"Cables concealed in walls — RCD recommended", code:"C3", reg:"522.6", section:"RCD", desc:"Cables concealed within walls/partitions are likely embedded at a depth less than 50mm and not contained within an earthed metallic wiring system. An RCD is recommended", proOnly:false },
  { id:"OB0059", title:"No RCD protection for socket outlets ≤32A", code:"C2", reg:"411.3.3", section:"RCD", desc:"There is no RCD protection in place as an additional requirement for circuits supplying socket outlets not exceeding 32A. 30mA RCDs are recommended", proOnly:false },
  { id:"OB0060", title:"Type AC RCD supplying equipment with electronic components", code:"C3", reg:"533.3.1", section:"RCD", desc:"Type AC RCDs may only be selected to supply fixed equipment where the load current contains no DC components", proOnly:false },
  { id:"OB0061", title:"No RCD protection for socket outlets supplying portable outdoor equipment", code:"C2", reg:"411.3.3", section:"RCD", desc:"RCD protection shall be provided for socket outlets that could potentially be used to supply portable appliances outside", proOnly:false },
  { id:"OB0063", title:"Circuits in bathroom zones without 30mA RCD protection", code:"C3", reg:"701.415", section:"RCD", desc:"There are low-voltage circuits serving/passing through zones 1/2 of locations containing a bath/shower. 30mA RCDs are recommended", proOnly:false },
  { id:"OB0064", title:"Bathroom circuits not protected by RCDs", code:"C2", reg:"701.415", section:"RCD", desc:"All circuits terminating within an area containing a shower/bath should be protected by RCDs", proOnly:false },
  { id:"OB0065", title:"RCD used for additional protection does not operate within required time", code:"C2", reg:"643.8", section:"RCD", desc:"RCD used for additional protection does not operate within the required time", proOnly:false },
  { id:"OB0066", title:"Incorrect selectivity between RCDs", code:"C3", reg:"536.4.1.4", section:"RCD", desc:"Incorrect selectivity between RCDs", proOnly:false },
  { id:"OB0069", title:"No RCD/RCBO protection for accessories near sink/draining board", code:"C2", reg:"415.1.1", section:"RCD", desc:"Absence of RCD/RCBO protection for accessories located in close proximity to a sink and/or draining board", proOnly:false },
  { id:"OB0070", title:"No 30mA RCD for lighting circuits in domestic premises", code:"C2", reg:"411.3.4", section:"RCD", desc:"Additional protection by an RCD with rated residual operating current not exceeding 30mA shall be provided for AC final circuits supplying luminaires in domestic premises", proOnly:false },
  { id:"OB0071", title:"Damaged equipment with exposed live parts", code:"C1", reg:"416.3", section:"Wiring", desc:"Damaged equipment with exposed live parts. Detail of action taken (e.g. circuit isolated, replaced accessory, rectified at time of test)", proOnly:false },
  { id:"OB0072", title:"Damaged equipment — further detail required", code:"C2", reg:"416.3", section:"Wiring", desc:"Damaged equipment. Additional detail required (e.g. burn mark from plug, cracked face plate)", proOnly:false },
  { id:"OB0073", title:"Minor damage to equipment", code:"C3", reg:"416.3", section:"Wiring", desc:"Minor damage to equipment", proOnly:false },
  { id:"OB0074", title:"Screws missing from DB cover — cover still secure", code:"C3", reg:"416.3", section:"Wiring", desc:"Screws missing from DB cover — cover still secure", proOnly:false },
  { id:"OB0075", title:"Screws missing from DB cover — cover not secure", code:"C2", reg:"416.3", section:"Wiring", desc:"Screws missing from DB cover — cover is not secure", proOnly:false },
  { id:"OB0078", title:"No IP2X protection (hole >12mm) on enclosure", code:"C2", reg:"416.3, 411.2", section:"Wiring", desc:"No IP2X protection (hole >12mm) on the bottom/side/front surface of the enclosure", proOnly:false },
  { id:"OB0080", title:"Light fitting not fixed securely", code:"C2", reg:"559.5.2", section:"Wiring", desc:"Light fitting not fixed securely", proOnly:false },
  { id:"OB0082", title:"Trunking lid is missing", code:"C3", reg:"521.10", section:"Wiring", desc:"Trunking lid is missing", proOnly:false },
  { id:"OB0083", title:"No mechanical protection for single insulated cables", code:"C2", reg:"521.10", section:"Wiring", desc:"No mechanical protection for single insulated cables", proOnly:false },
  { id:"OB0085", title:"Socket outlets mounted too low — risk of mechanical damage", code:"C2", reg:"554", section:"Wiring", desc:"Socket outlets shall be mounted high enough to minimise the risk of mechanical damage", proOnly:false },
  { id:"OB0086", title:"Flexible cable not held securely in flex grip/gland — no damage", code:"C3", reg:"522.8.5", section:"Wiring", desc:"Flexible cable is not held in flex grip/gland securely. No damage to cables", proOnly:false },
  { id:"OB0087", title:"Flexible cable not held securely — cable is damaged", code:"C2", reg:"522.8.5", section:"Wiring", desc:"Flexible cable is not held in flex grip/gland securely. Cable is now damaged", proOnly:false },
  { id:"OB0089", title:"Cables not adequately supported", code:"C3", reg:"522.8.4", section:"Wiring", desc:"Cables are not adequately supported", proOnly:false },
  { id:"OB0093", title:"Isolator cannot be secured in the off position", code:"C2", reg:"537.2.4", section:"Wiring", desc:"The isolator cannot be secured in the off position", proOnly:false },
  { id:"OB0095", title:"Incorrect IP protection near sink/draining board", code:"C2", reg:"421.2", section:"Wiring", desc:"Incorrect IP protection for accessories located in close proximity to a sink and/or draining board", proOnly:false },
  { id:"OB0096", title:"Consumer unit not manufactured from non-combustible material", code:"C4", reg:"421.2", section:"Wiring", desc:"Consumer unit/switchgear is not manufactured from non-combustible material or enclosed in a cabinet of non-combustible material within domestic premises", proOnly:false },
  { id:"OB0097", title:"No main switch present at origin to isolate whole installation", code:"C2", reg:"462.2", section:"Wiring", desc:"There is no main switch present at the origin in order to isolate the whole installation", proOnly:false },
  { id:"OB0101", title:"Signs of corrosion within DB", code:"C2", reg:"522.5.1", section:"Wiring", desc:"Signs of corrosion within DB", proOnly:false },
  { id:"OB0109", title:"Downlighters have no integral fire protection or fire hoods", code:"C2", reg:"421.1.2", section:"Wiring", desc:"Downlighters do not have integral fire protection or fire hoods installed. It is recommended that at least one of these be in place to reduce the risk of spread of fire", proOnly:false },
  { id:"OB0112", title:"VIR cable showing signs of deterioration", code:"C2", reg:"511.1", section:"Wiring", desc:"Vulcanised Indian rubber (VIR) cable has been installed and is showing signs of deterioration", proOnly:false },
  { id:"OB0114", title:"Insulation resistance reading below minimum tabulated value", code:"C2", reg:"6.4.3.3.1, Table 6.1", section:"Wiring", desc:"Insulation resistance reading taken is below the minimum tabulated value", proOnly:false },
  { id:"OB0115", title:"Incorrect polarity on circuit or connection at equipment", code:"C1", reg:"6.4.3.6", section:"Wiring", desc:"Incorrect polarity on the circuit or connection at piece of equipment", proOnly:false },
  { id:"OB0116", title:"Incorrect polarity on Edison screw lampholders", code:"C1", reg:"6.4.3.6", section:"Wiring", desc:"Incorrect polarity on Edison screw lampholders", proOnly:false },
  { id:"OB0117", title:"No segregation of circuits — fire alarm/emergency lighting", code:"C3", reg:"527", section:"Wiring", desc:"No segregation of circuits (fire alarm/emergency lighting)", proOnly:false },
  { id:"OB0322", title:"All untraced circuits must have circuit designations verified", code:"C2", reg:"514.4", section:"Identification", desc:"All untraced circuits must have their circuit designations verified", proOnly:false },
  { id:"OB0325", title:"Circuits not arranged or marked for identification", code:"C3", reg:"514.3.1", section:"Identification", desc:"Circuits are not arranged or marked so they can be identified for inspection and testing", proOnly:false },
  { id:"OB0326", title:"Live conductors incorrectly identified", code:"C3", reg:"514.3.1", section:"Identification", desc:"Live conductors are incorrectly identified", proOnly:false },
  { id:"OB0327", title:"Circuit protective conductor incorrectly identified", code:"C3", reg:"514.3", section:"Identification", desc:"Circuit protective conductor is incorrectly identified", proOnly:false },
  { id:"OB0329", title:"No bonding label present at termination", code:"C3", reg:"514.1", section:"Identification", desc:"There is no bonding label present at the termination", proOnly:false },
  { id:"OB0330", title:"Isolators have no labels indicating their purpose", code:"C3", reg:"514.1", section:"Identification", desc:"Isolators have no labels indicating their purpose", proOnly:false },
  { id:"OB0332", title:"No detailed diagram/chart at distribution board", code:"C3", reg:"514.5", section:"Identification", desc:"A detailed legible diagram, chart or table has not been provided in the vicinity of the distribution board indicating type and composition of circuits", proOnly:false },
  { id:"OB0333", title:"Bare CPC conductor does not have sleeving installed", code:"C2", reg:"514.3", section:"Identification", desc:"Bare CPC conductor does not have sleeving installed", proOnly:false },
  { id:"OB0334", title:"No alternative supply warning notice at consumer unit/distribution board", code:"C3", reg:"514.1", section:"Identification", desc:"No presence of alternative supply warning notice at consumer unit/distribution board", proOnly:false },
  { id:"OB0335", title:"No 30mA RCD protection for final circuits in Group 1 medical location", code:"C2", reg:"710.411.4", section:"Special Locations", desc:"All final circuits of Group 1 medical locations rated up to 32A shall have additional 30mA RCD protection", proOnly:true },
  { id:"OB0350", title:"Circuits in bathroom zones without additional RCD protection", code:"C2", reg:"701.410.3", section:"Special Locations", desc:"There are low-voltage circuits serving/passing through zones 1/2 of locations containing a bath/shower. 30mA RCDs are recommended", proOnly:false },
  { id:"OB0352", title:"Accessible socket outlet installed within 2.5m of Zone 1", code:"C2", reg:"701.512.4", section:"Special Locations", desc:"Accessible socket outlet installed within 2.5m of Zone 1", proOnly:false },
  { id:"OB0370", title:"Agricultural electrical equipment — IP rating below IP44", code:"C2", reg:"705.512.2", section:"Special Locations", desc:"Any electrical equipment in agricultural areas shall have a minimum degree of protection of IP44", proOnly:false },
  { id:"OB0371", title:"Agricultural circuit — no RCD protection ≤300mA", code:"C2", reg:"705.411.1", section:"Special Locations", desc:"Any circuit in an agricultural area shall have RCD protection not exceeding 300mA", proOnly:false },
  { id:"OB0400", title:"EV charging point not on dedicated final circuit", code:"C2", reg:"722.533.101", section:"Special Locations", desc:"The EV charging point has not been supplied from a dedicated final circuit", proOnly:false },
  { id:"OB0402", title:"EV charging point supply protected by AC type RCD only", code:"C2", reg:"722.531.3.101", section:"Special Locations", desc:"The EV charging point supply is protected by an AC type RCD", proOnly:false },
  { id:"OB0406", title:"Suspected asbestos present within distribution board", code:"C3", reg:"I.S. 10101", section:"Other", desc:"Suspected asbestos present within distribution board. This should be proven otherwise and a record held on site, or professionally removed", proOnly:false },
];

// ─── REGULATIONS ──────────────────────────────────────────────────────────
const REGULATIONS = [
  { num:"411.3.3", title:"RCD Protection — Socket Outlets", body:"Socket outlets with a rated current not exceeding 32A intended for use by ordinary persons shall be protected by one or more RCDs each having a rated residual operating current not exceeding 30mA." },
  { num:"411.4.4", title:"Maximum Earth Fault Loop Impedance", body:"The earth fault loop impedance Zs shall not exceed the value for which the overcurrent protective device will operate within the required disconnection time. See Appendix 4 for maximum Zs values." },
  { num:"421.7", title:"Arc Fault Detection Devices", body:"Where a circuit supplies sleeping accommodation, consideration shall be given to the installation of an AFDD to provide additional protection against fire from arc faults." },
  { num:"433.1", title:"Overload Protection", body:"Every circuit shall be protected against overload current. The characteristics of the protective device shall satisfy the conditions relating to design current and conductor current-carrying capacity." },
  { num:"443.4", title:"Surge Protective Devices", body:"Where the consequences of overvoltage could cause danger to persons, serious financial loss or interruption of essential services, surge protective devices shall be provided." },
  { num:"514.5", title:"Circuit Charts", body:"A legible diagram, chart or table shall be provided at every distribution board indicating the type and composition of each circuit, the method of protection against indirect contact, and circuit identification." },
  { num:"521.5.1", title:"Current-Carrying Capacity", body:"The current-carrying capacity of a conductor shall not be less than the design current of the circuit it serves." },
  { num:"526.1", title:"Electrical Connections", body:"Every connection between conductors or between a conductor and equipment shall provide durable electrical continuity and adequate mechanical strength and protection." },
  { num:"530.3.3", title:"Switching in Neutral", body:"A single-pole switching or protective device shall not be inserted in the neutral conductor." },
  { num:"534.4.1", title:"Surge Protection — Installation Date", body:"For new installations or major alterations, surge protective devices shall be provided where the consequences of overvoltage could result in danger. From 2022, SPDs are required by default unless omitted with justification." },
  { num:"537.1.2", title:"Isolation at Origin", body:"A means of isolation shall be provided at the origin of every installation, enabling the installation to be isolated from the supply. The means of isolation shall disconnect all live conductors." },
  { num:"542.1.1", title:"Earthing Arrangements", body:"An earthing conductor connecting the main earthing terminal to the means of earthing shall be provided. It shall be suitably protected against corrosion and mechanical damage." },
  { num:"544.1.1", title:"Main Protective Bonding", body:"Protective bonding conductors shall connect the main earthing terminal to extraneous-conductive-parts including water, gas, oil pipework and structural steel that are liable to introduce a potential." },
  { num:"612.2", title:"Continuity of Protective Conductors", body:"The continuity of each protective conductor, including the main and supplementary bonding conductors, shall be verified by test." },
  { num:"612.3", title:"Insulation Resistance", body:"The insulation resistance shall be measured between live conductors connected together and earth. The insulation resistance shall not be less than the value in Table 61." },
  { num:"612.6", title:"Polarity", body:"A test shall be made to verify that all fuses, switches and single-pole control devices are connected in the line conductor only and that all circuits are correctly connected." },
  { num:"701.415.2", title:"Bathrooms — Supplementary Bonding", body:"Supplementary protective bonding shall connect simultaneously accessible exposed-conductive-parts and extraneous-conductive-parts within zones 1 and 2 of a bathroom." },
  { num:"701.512.3", title:"Bathrooms — Socket Outlets", body:"Socket outlets shall not be installed in zones 0, 1 or 2. Shaver supply units complying with BS EN 61558-2-5 may be installed outside zone 0." },
  { num:"722.531.2", title:"EV Charging — RCD Type", body:"Every electric vehicle charging point shall be provided with an RCD of Type B, unless a device providing equivalent protection against all AC and DC fault currents is used." },
  { num:"722.411.4", title:"EV — PME Supply", body:"Where a PME earthing facility is used, the earth terminal of a charging point shall be connected to an earth electrode unless a protective device operating within 5 seconds is provided." },
];

// ─── SPECIAL LOCATIONS ────────────────────────────────────────────────────
const LOCATIONS = [
  { icon:"🚿", name:"Bathrooms & Shower Rooms", ref:"Part 701", color:C.cyan, proOnly:false, items:[
    { label:"Zone 0", value:"Inside bath/shower trough only. IPX7 minimum. SELV ≤12V AC / 30V DC only." },
    { label:"Zone 1", value:"Above bath/shower trough to 2.25m height. IPX4 minimum. SELV or shaver units (BS EN 61558-2-5) only." },
    { label:"Zone 2", value:"0.6m beyond zone 1 edge. IPX4 minimum." },
    { label:"RCD protection", value:"30mA RCD required for all circuits in zones 0, 1 and 2." },
    { label:"Socket outlets", value:"Not permitted in zones 0, 1 or 2. Shaver units only if compliant with BS EN 61558-2-5." },
    { label:"Regulation", value:"I.S. 10101 Part 701" },
  ]},
  { icon:"🏊", name:"Swimming Pools", ref:"Part 702", color:C.green, proOnly:false, items:[
    { label:"Zone A", value:"Inside water volume. IPX8. SELV ≤12V AC / 30V ripple-free DC only. No switching devices." },
    { label:"Zone B", value:"0–2m from water edge, 0–2.5m height. IPX5. SELV or special transformers permitted." },
    { label:"Zone C", value:"2–3.5m from water edge. IPX2 indoor / IPX4 outdoor. Standard equipment permitted." },
    { label:"RCD protection", value:"All circuits in zones A, B and C must be protected by 30mA RCD." },
    { label:"Equipotential bonding", value:"All extraneous-conductive-parts within zones A, B, C must be connected to supplementary equipotential bonding." },
    { label:"Regulation", value:"I.S. 10101 Part 702" },
  ]},
  { icon:"🧖", name:"Sauna Rooms", ref:"Part 703", color:C.warn, proOnly:false, items:[
    { label:"Zone 1", value:"To 0.5m above floor. Equipment must withstand 125°C ambient." },
    { label:"Zone 2", value:"0.5m–1.5m above floor. Equipment must withstand 125°C ambient." },
    { label:"Zone 3", value:"Remainder of sauna room. 125°C ambient." },
    { label:"Wiring systems", value:"Heat-resistant cables only (mineral insulated or equivalent). No PVC in zones 1–3." },
    { label:"Controls", value:"Control and protective devices must be located outside the sauna room." },
    { label:"RCD", value:"30mA RCD protection required for all sauna circuits." },
    { label:"Regulation", value:"I.S. 10101 Part 703" },
  ]},
  { icon:"🐄", name:"Agricultural Locations", ref:"Part 705", color:C.teal, proOnly:false, items:[
    { label:"Wiring systems", value:"Cables must be protected against mechanical damage, moisture and animal activity. Armoured or conduit recommended." },
    { label:"RCD", value:"30mA RCD for socket outlet circuits. 100mA or 300mA for fixed equipment where 30mA is impractical." },
    { label:"Equipotential bonding", value:"Supplementary equipotential bonding required in animal husbandry locations to limit step and touch voltages." },
    { label:"Disconnection time", value:"0.2 seconds maximum for TN systems. Livestock are more sensitive to electric shock than humans." },
    { label:"IP rating", value:"IP44 minimum for all equipment in agricultural buildings." },
    { label:"Regulation", value:"I.S. 10101 Part 705" },
  ]},
  { icon:"⚡", name:"Conducting Locations", ref:"Part 706", color:C.purple, proOnly:false, items:[
    { label:"Definition", value:"Locations with conductive surroundings where risk of electric shock is increased — boiler rooms, metal tanks, confined metalwork." },
    { label:"SELV / PELV", value:"SELV or PELV at ≤25V AC / 60V DC recommended for portable tools and local lighting." },
    { label:"RCD", value:"30mA RCD required on all circuits supplying equipment within the location." },
    { label:"Equipotential bonding", value:"All metalwork must be interconnected and bonded to earth." },
    { label:"Regulation", value:"I.S. 10101 Part 706" },
  ]},
  { icon:"🚗", name:"EV Charging Installations", ref:"Part 722", color:"#4FC3F7", proOnly:false, items:[
    { label:"RCD Type B", value:"Every charging point must have Type B RCD unless equivalent DC fault protection is built into the EVCP." },
    { label:"Dedicated circuit", value:"Each charging point should be served by a dedicated final circuit from the consumer unit." },
    { label:"PME supply", value:"PME earthing must not be used unless an earth electrode and additional protective measures are applied." },
    { label:"IP rating", value:"IP44 minimum for outdoor installations." },
    { label:"Regulation", value:"I.S. 10101 Part 722 / ESB Networks guidance" },
  ]},
  { icon:"☀️", name:"Solar PV Systems", ref:"Part 712", color:"#FFD23F", proOnly:false, items:[
    { label:"DC wiring", value:"DC cables must be PV-specific, UV-resistant, double-insulated. Segregated from AC wiring." },
    { label:"Isolation", value:"AC and DC isolation required. DC isolator at inverter and at array." },
    { label:"RCD", value:"Type B or equivalent required on AC side if inverter does not have built-in DC fault monitoring." },
    { label:"Labelling", value:"Warning labels required at consumer unit, meter, inverter and roof penetration points." },
    { label:"Regulation", value:"I.S. 10101 Part 712 / SEAI guidelines" },
  ]},
  { icon:"🏥", name:"Medical Locations", ref:"Part 710", color:C.danger, proOnly:true, items:[
    { label:"Group 0", value:"No medical electrical equipment applied to patient. Standard protection applies." },
    { label:"Group 1", value:"External or non-invasive equipment applied to patient. Enhanced protection required." },
    { label:"Group 2", value:"Invasive procedures, life-support, operating theatres. IT system required." },
    { label:"IT system", value:"IT power systems with insulation monitoring required for Group 2. Maximum touch voltage 25V." },
    { label:"RCD", value:"30mA RCD for final circuits in Group 1 and 2 (except IT circuits)." },
    { label:"Regulation", value:"I.S. 10101 Part 710" },
  ]},
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
      <div style={{ fontSize:13, color:C.muted, marginBottom:16, lineHeight:1.6 }}>Sign in to access the full 2,500+ observation database and advanced regulation search.</div>
      <button onClick={onLogin} style={{ ...st.btn, marginTop:0 }}>SIGN IN TO CIRCUITFLOW</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREENS
// ═══════════════════════════════════════════════════════════════════════════

function HomeScreen({ navigate, isLoggedIn }) {
  const tools = [
    { id:"zs",        icon:"📊", label:"Zs Calculator",      desc:"Max Zs pass/fail",     color:C.cyan   },
    { id:"obs",       icon:"⚠️", label:"Observation Lookup", desc:"C1 / C2 / C3 / FI",   color:C.warn   },
    { id:"rcd",       icon:"🧪", label:"RCD Test Times",     desc:"Trip time limits",      color:C.green  },
    { id:"locations", icon:"🏠", label:"Special Locations",  desc:"Part 7 quick guide",   color:C.purple },
    { id:"checklist", icon:"✅", label:"Checklists",         desc:"DB · Socket · EICR",   color:C.teal   },
    { id:"regs",      icon:"📚", label:"Regulation Search",  desc:"I.S. 10101 lookup",    color:C.danger },
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
      <div style={st.tip}>💡 I.S. 10101 — 100% rule applied (Irish standard).</div>
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
              <span style={{ fontSize:13, fontFamily:"monospace", fontWeight:700, color:["Regulation","Standard"].includes(k)?C.cyan:C.text }}>{v}</span>
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
  { id:"home",      icon:"⚡", label:"Home"    },
  { id:"zs",        icon:"📊", label:"Zs Calc" },
  { id:"obs",       icon:"⚠️", label:"Obs"     },
  { id:"regs",      icon:"📚", label:"Regs"    },
];

export default function CompanionApp({ isLoggedIn = false, onLogin = () => {} }) {
  const [screen, setScreen] = useState("home");
  const nav = id => setScreen(id);
  const home = () => setScreen("home");
  const activeNav = NAV.find(n => n.id === screen) ? screen : "home";
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
          {isLoggedIn && (
            <div style={{ marginLeft:"auto", fontSize:11, color:C.green, background:"rgba(0,255,136,0.1)", padding:"3px 10px", borderRadius:20, border:"1px solid rgba(0,255,136,0.25)" }}>PRO</div>
          )}
        </div>
      </div>

      {/* BODY */}
      <div style={{ flex:1, overflowY:"auto", padding:"16px 16px 0" }}>
        {screen==="home"      && <HomeScreen navigate={nav} isLoggedIn={isLoggedIn} />}
        {screen==="zs"        && <ZsScreen {...sharedProps} />}
        {screen==="obs"       && <ObsScreen {...sharedProps} />}
        {screen==="rcd"       && <RcdScreen {...sharedProps} />}
        {screen==="locations" && <LocationsScreen {...sharedProps} />}
        {screen==="checklist" && <ChecklistScreen {...sharedProps} />}
        {screen==="regs"      && <RegsScreen {...sharedProps} />}
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
