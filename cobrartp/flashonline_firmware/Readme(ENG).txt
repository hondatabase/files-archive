CobraRTP FlashOnline internal firmware update. To update, use the .UPD file corresponding to your revision of the Rev X.X board (see on the device board).
The instruction is in the archive with the CobraRTP Utility program.

Changelog:

v1.30
-Added support for Big-endian byte ordering system to support Motorola processors (Siemens MSS52-54 etc.)

v1.25 bugfix
-Fixed a short interruption in communication with the ECU after 1 second after power up (for 28F200, 29F200, 29F400).

v1.24 bugfix
-Fixed incorrect memory organization under certain conditions (memory block/memory type)

v1.23 (optional)
-Added support for RAM emulator diagnostic function (CobraRTP Utility v2.97+)
-Fixed battery indication bug
-Minor improvements

v1.22
-Added support for data encoding for ECUs with non-standard flash memory connection to the processor (Siemens 5WY (Simk31-43), 5WK (SMG2), MS5150, EMS2000, Sirius32, Simos 3 and others)
-Added device backup battery charge control (only for Rev3.1 and above)
-Optimized code
(CobraRTP Utility 2.9+ is required to support these features)

v1.21
-Fix small bugs

v1.20 
-Added address hit tracking function (TunerPRO RT support)! (Testet on Bosch ME7.1, EDC15P+, Siemens MS41/42/43)

v1.15b
-Fixed a bug where the engine could stall when the emulator memory was changed for the first time
-Fixed emulator freezing when exiting TunerPRO or software shutdown.
-Attempts have been made to achieve traceability in TunerPRO


cobrartp.com/en
cobrartpteam@gmail.com