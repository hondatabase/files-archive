/******************************************
	disIACV
	Author: Chris Harris (with help from Damian Badalamenti)
	Description: Disable/Enable the IACV, in the p30/p28/p72 rom's
	History:
	9Apr2006 - XENOCRON - Written 
	10Jul2024 - VIRUXE (Flavio Pereira) - slight cleanup
*/	

addPlugin('XENOCRON', 'Enable/Disable IACV', () => {
	const romType = rom.base;
	switch (romType) {
	  case rtP28: case rtP72:
		alert('Support for this rom has not been added yet!');
		break;
	  case rtP30:
		const iacvEnabled   = rom.byteAt(0x3C6F) === 0x00;
		const confirmAction = iacvEnabled ? 'ENABLE' : 'DISABLE';
		
		if (confirm(`IACV is currently ${iacvEnabled ? 'DISABLED' : 'ENABLED'}. Do you want to ${confirmAction} the IACV?`)) {
			rom.byteAt(0x3C6F) = iacvEnabled ? 0x01 : 0x00;
			alert(`IACV has been ${confirmAction}D.`);
		}
	}
}, '', 4);