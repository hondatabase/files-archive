//---------------------------------------------------------------------------
#include <vcl.h>
#pragma hdrstop

#include <stdlib.h>
#include <stdio.h>
#include "ecupm71.h"
#include "Unit2.h"
//---------------------------------------------------------------------------
#pragma package(smart_init)
#pragma resource "*.dfm"
TForm1 *Form1;

void OpenBinFile(char *bFile);
void ReadType();
void ReadBinVal();
void DisplayValues();
void ResetValues();
void WriteNewBin(char *NewFile);
void ImportMap(char *Mapfile);
void ExportMap(char *Mapfile);
void UpdateChecksum();

FILE *BinFile,*NewBinFile;
unsigned char BinObj[64000];
char HeadObj[2000];

char LnBuf[20][10] = {"Rpm/Map","26 lnHg","24","22","21","19","18","16","14",
                      "13","11","9","8","4","1","1.3 Psi"};
char RpmBuf[20][10] = {"500","600","700","800","900","1100","1300","1600","1900",
                       "2200","2600","3100","3700","4400","5300","6300","7400"};


long RevColdAdr=0;
long RevWarmAdr=0;
long IdleAdr=0;
long LaunchAdr=0;
long FuelMulAdr=0;
long IgnMapAdr=0;
long FuelMapAdr=0;
long ChkSumAdr;
long ChkArea;
long ChkSumMod;
int  ChkSumChk;

char BinInpFile[255];
char PMType[10];
char ProgType[20];
unsigned char FuelOrgArr[17][15];
unsigned char IgnOrgArr[17][15];
unsigned char FuelNewArr[17][15];
unsigned char IgnNewArr[17][15];
float FuelMapArr[17][15];
float IgnMapArr[17][15];
float FuelMult[2][20];
unsigned char FuelMultArr[15];
int  RevColdLim;
int  RevWarmLim;
int  Idle;
int  Launch;
long FileLen;

int  ModelNum;

//---------------------------------------------------------------------------

void OpenBinFile(char *bFile)
{
    int i=0;
    int intchr;

    ResetValues();
    sprintf(BinInpFile,"%s",bFile);
    BinFile = fopen(bFile,"rb");
    if (!(BinFile))
        return;
    while (!feof(BinFile))
    {
        intchr = fgetc(BinFile);
        BinObj[i] = intchr;
        if (i<2000)
            HeadObj[i] = intchr;
        i++;
    }
    fclose(BinFile);
    FileLen = i-1;

    ReadType();
    if (ModelNum < 100)
    {
        ReadBinVal();
        DisplayValues();
    }
    else
    {
        Form1->Edit4->Text = PMType;
        Form1->Edit4->Refresh();
        Form1->Edit1->Text = "Not supported";
        Form1->Edit1->Refresh();
    }
}

void ReadType()
{
    int     i;

    ModelNum = 100;

//**************** PM7 ************************
    if ((HeadObj[0] == '\x01') && (HeadObj[3] == '\xC0'))
    {
        sprintf(PMType,"PM7");
        // DOHC e020 & mugen
        if ((HeadObj[1] == '\x2C') && (HeadObj[3] == '\xC0'))
        {
            if (HeadObj[1473] == '\x34')
            {
                sprintf(ProgType,"D16A9 (ZC Euro)");
                ChkSumMod = 0x4000;
                ChkSumAdr = 0x23BF;
                ChkArea = 0x4000;
                ModelNum = 0;
            }

            if (HeadObj[1473] == '\x37')
            {
                sprintf(ProgType,"D16A9 (Mugen)");
                ChkSumAdr = 0x23BF;
                ChkArea = 0x4000;
                ModelNum = 1;
            }

            RevColdAdr=0x0F59;
            RevWarmAdr=0x0F53;
            IdleAdr=0x3B53;
            IgnMapAdr=0x3CE5;
            FuelMapAdr=0x3EF2;
            FuelMulAdr=0x3FF1;
        }
        // DOHC KAT  zc euro, jdm & usdm
        if ((HeadObj[1] == '\x2F') && (HeadObj[3] == '\xC0'))
        {
            if (HeadObj[31] == '\x04')
            {
                sprintf(ProgType,"D16Z5 (ZC Euro kat)");
                ChkSumMod = 0x5250;
                ChkArea = 0x5300;
                ModelNum = 2;
            }
            if ((HeadObj[31] == '\x01') && (HeadObj[32] == '\xC5'))
            {
                sprintf(ProgType,"SiR (US)");
                ChkSumMod = 0x50FC;
                ChkArea = 0x5100;
                ModelNum = 3;
            }

            if ((HeadObj[31] == '\x01') && (HeadObj[32] == '\xD5'))
            {
                sprintf(ProgType,"ZC ORG");
                ChkSumMod = 0x5250;
                ChkArea = 0x5300;
                ModelNum = 4;
            }

            if ((HeadObj[31] == '\x02') && ((HeadObj[32] == '\x7B') || (HeadObj[32] == '\x06')))
            {
                sprintf(ProgType,"Euro");
                ChkSumMod = 0x4A00;
                ChkArea = 0x5100;
                ModelNum = 5;
            }

            RevColdAdr=0x0EB2;
            RevWarmAdr=0x0EAC;
            IdleAdr=0x39F0;
            IgnMapAdr=0x3DF3;
            FuelMapAdr=0x3EF2;
            FuelMulAdr=0x3FF1;

        }
    }

//************** PM6 ***************************
    else if (HeadObj[0] == '\x02')   // PM6 group
    {
        sprintf(PMType,"PM6");
        if ((HeadObj[2] == '\x00') && (HeadObj[3] == '\xC0'))
        {
            sprintf(ProgType,"D16A6");
            RevColdAdr=0x0DEC;
            RevWarmAdr=0x0DE6;
            IdleAdr=0x3993;
            IgnMapAdr=0x3DF3;
            FuelMapAdr=0x3EF2;
            FuelMulAdr=0x3FF1;
            ChkSumMod = 0x4A00;
            ChkArea = 0x5000;
            ModelNum = 6;
        }
        // GhettoDyne
        if ((HeadObj[2] == '\x03') && (HeadObj[3] == '\xC0'))
        {
            sprintf(ProgType,"GhettoDyne/PGMFI");
            RevColdAdr=0x0DEC;
            RevWarmAdr=0x0DE6;
            IdleAdr=0x399F;
            IgnMapAdr=0x3DFF;
            FuelMapAdr=0x3EFE;
            FuelMulAdr=0x3FFD;
            LaunchAdr=0x40EB;
            ChkSumMod = 0x438C;
            ChkArea = 0x5000;
            ModelNum = 7;
        }
    }
    else if ((HeadObj[0] == '\x01') && (HeadObj[3] == '\x02'))  // PR4 group
    {
        sprintf(PMType,"PR4");
        if ((HeadObj[0] == '\x01') && (HeadObj[3] == '\x02'))
        {
            sprintf(ProgType,"");
            RevColdAdr=0x0F53;
            RevWarmAdr=0x109B;
            IdleAdr=0x438D;
            IgnMapAdr=0x50FF;
            FuelMapAdr=0x541A;
            FuelMulAdr=0x540B;
            ChkSumMod = 0x4A00;
            ChkArea = 0x5700;
            ModelNum = 8;
        }
    }
    else if (HeadObj[0] == '\xD8')   // PW0 group
    {
        sprintf(PMType,"PW0");
        if (HeadObj[0] == '\xD8')
        {
            sprintf(ProgType,"");
            RevColdAdr=0x0F59;
            RevWarmAdr=0x0F53;
            IdleAdr=0x3B53;
            // IgnMapAdr=0x3BE6;
            IgnMapAdr=0x3CF4;
            FuelMapAdr=0x3EF2;
            FuelMulAdr=0x3EE3;
            ChkSumAdr = 0x2045;
            ChkArea = 0x4000;
            ModelNum = 9;
        }
    }
}

void ReadBinVal()
{
    int i,j,k;
    char Warm[4];

    if (RevWarmAdr > 0)
    {
        j = BinObj[RevWarmAdr+2];
        j += BinObj[RevWarmAdr] * 256;
        if (j > 0)
            RevWarmLim = 1920000 / j;
    }
    if (IdleAdr > 0)
    {
        j = BinObj[IdleAdr+2];
        j += BinObj[IdleAdr] * 256;
        if (j > 0)
            Idle = 1920000 / j;
    }

    if (LaunchAdr > 0)
    {
        j = BinObj[LaunchAdr+2];
        j += BinObj[LaunchAdr] * 256;
        if (j > 0)
            Launch = 1920000 / j;
    }

    k = IgnMapAdr;
    for(i=0;i<17;i++)
        for(j=0;j<15;j++,k++)
            IgnOrgArr[i][j] = BinObj[k];
    k = FuelMapAdr;
    for(i=0;i<17;i++)
        for(j=0;j<15;j++,k++)
            FuelOrgArr[i][j] = BinObj[k];

    for(k=0;k<15;k++)
    {
        if (BinObj[FuelMulAdr+k] != 0)
        {
            FuelMult[0][k] = 208.0 / (2 << (BinObj[FuelMulAdr+k]-1));
            FuelMult[1][k] = 224.0 / (2 << (BinObj[FuelMulAdr+k]-1));
        }
        else
        {
            FuelMult[0][k] = 208.0;
            FuelMult[1][k] = 224.0;
        }
        FuelMultArr[k] = BinObj[FuelMulAdr+k];
    }

    ChkSumChk = 0;
    if (ChkArea > FileLen)
        ChkArea = FileLen;
    for (i=0;i<ChkArea;i++)
    {
        ChkSumChk = ChkSumChk + BinObj[i];
    }
    ChkSumChk = ChkSumChk % 256;

}


void DisplayValues()
{
    char    IgnStr[10];
    char    FuelStr[10];
    int     i,j;

    Form1->Edit4->Text = PMType;
    Form1->Edit4->Refresh();
    Form1->Edit1->Text = ProgType;
    Form1->Edit1->Refresh();

    if (ModelNum == 7)
    {
        Form1->Edit5->Enabled = true;
        Form1->Edit5->Color = clWindow;
        Form1->Edit5->Text = "";
        Form1->Edit9->Enabled = true;
        Form1->Edit9->Text = "Yes";
    }
    else
    {
        Form1->Edit5->Enabled = false;
        Form1->Edit5->Color = clInactiveBorder;
        Form1->Edit5->Text = "No";
        Form1->Edit9->Enabled = false;
        Form1->Edit9->Text = "No";
    }

    // Warm rev
    if (ModelNum == 9)
    {
        Form1->Edit2->Enabled = false;
        Form1->Edit2->Color = clInactiveBorder;
        Form1->Edit2->Text = "";
        Form1->Edit2->Refresh();
    }
    else
    {
        Form1->Edit2->Enabled = true;
        Form1->Edit2->Color = clWindow;
        Form1->Edit2->Text = RevWarmLim;
        Form1->Edit2->Refresh();
    }

    // Idle
    if (IdleAdr > 0)
    {
        Form1->Edit3->Text = Idle;
        Form1->Edit3->Refresh();
    }

    if (LaunchAdr > 0)
    {
        Form1->Edit5->Text = Launch;
        Form1->Edit5->Refresh();
    }
    Form1->Edit6->Text = BinInpFile;
    Form1->Edit6->Refresh();

    if ((ModelNum < 2) && (BinObj[ChkSumAdr] == 0x80))
        Form1->Edit7->Text = "Disabled";
    else
        Form1->Edit7->Text = ChkSumChk;
    Form1->Edit7->Refresh();
    Form1->Edit8->Text = ChkArea;
    Form1->Edit8->Refresh();

    for (i=0;i<16;i++)
    {
       Form1->StringGrid1->Cells[i][0] = LnBuf[i];
       Form1->StringGrid2->Cells[i][0] = LnBuf[i];
    }
    for (i=1;i<18;i++)
    {
       Form1->StringGrid1->Cells[0][i] = RpmBuf[i-1];
       Form1->StringGrid2->Cells[0][i] = RpmBuf[i-1];
    }

    for(i=0;i<17;i++)
    {
        for(j=0;j<15;j++)
        {
            IgnMapArr[i][j] = ((IgnOrgArr[i][j] - 15.0) * 9.0) / 25.0;
            sprintf(IgnStr,"%.2f",IgnMapArr[i][j]);
            Form1->StringGrid1->Cells[j+1][i+1] = IgnStr;
        }
    }
    for(i=0;i<17;i++)
    {
        for(j=0;j<15;j++)
        {
            FuelMapArr[i][j] = (FuelOrgArr[i][j] + FuelMult[1][j]) / FuelMult[0][j];
            sprintf(FuelStr,"%.2f",FuelMapArr[i][j]);
            Form1->StringGrid2->Cells[j+1][i+1] = FuelStr;
        }
    }
}

void ResetValues()
{
    int i,j;

    sprintf(PMType,"");
    sprintf(ProgType,"");
    RevWarmAdr = 0;
    IdleAdr = 0;
    LaunchAdr = 0;

    Form1->Edit4->Text = "";
    Form1->Edit4->Refresh();
    Form1->Edit1->Text = "";
    Form1->Edit1->Refresh();
    Form1->Edit2->Text = "";
    Form1->Edit2->Refresh();
    Form1->Edit3->Text = "";
    Form1->Edit3->Refresh();
    Form1->Edit5->Text = "";
    Form1->Edit5->Refresh();
    Form1->Edit6->Text = "";
    Form1->Edit6->Refresh();
    Form1->Edit7->Text = "";
    Form1->Edit7->Refresh();
    Form1->Edit8->Text = "";
    Form1->Edit8->Refresh();
    Form1->Edit9->Text = "";
    Form1->Edit9->Refresh();

    for(i=0;i<17;i++)
        for(j=0;j<15;j++)
            Form1->StringGrid1->Cells[j+1][i+1] = "";
    for(i=0;i<17;i++)
        for(j=0;j<15;j++)
            Form1->StringGrid2->Cells[j+1][i+1] = "";
}

void WriteNewBin(char *NewFile)
{
    int i,j,k,l;
    int uchar;
    int tmpfakt;
    int b1,b2;
    char tmpstr[10];
    char IgnStr[20];
    char FuelStr[20];
    float IgnFl,FuelFl;
    float FlCheck;
    int IgnInt,FuelInt;

    NewBinFile = fopen(NewFile,"wb+");
    if (!(NewBinFile))
        return;

    for(i=0;i<FileLen;i++)
    {
        if ((i == RevWarmAdr) && (RevWarmAdr > 0))
        {
            sprintf(tmpstr,"%s",Form1->Edit2->Text);
            tmpfakt = 1920000 / atoi(tmpstr);
            b1 = tmpfakt / 256;
            b2 = tmpfakt % 256;
            BinObj[i] = b1;
            BinObj[i+2] = b2;
            i+=3;
        }
        else if ((i == IdleAdr) && (IdleAdr > 0))
        {
            sprintf(tmpstr,"%s",Form1->Edit3->Text);
            tmpfakt = 1920000 / atoi(tmpstr);
            b1 = tmpfakt / 256;
            b2 = tmpfakt % 256;
            BinObj[i] = b1;
            BinObj[i+2] = b2;
            i+=3;
        }
        else if ((i == LaunchAdr) && (LaunchAdr > 0))
        {
            sprintf(tmpstr,"%s",Form1->Edit5->Text);
            tmpfakt = 1920000 / atoi(tmpstr);
            b1 = tmpfakt / 256;
            b2 = tmpfakt % 256;
            BinObj[i] = b1;
            BinObj[i+2] = b2;
            i+=3;
        }
        else if (IgnMapAdr == i)
        {
            for(k=0;k<17;k++)
            {
                for(l=0;l<15;l++)
                {
                    sprintf(IgnStr,"%s",Form1->StringGrid1->Cells[l+1][k+1]);
                    IgnFl = atof(IgnStr);
                    FlCheck = IgnMapArr[k][l]-IgnFl;
                    if ((FlCheck > 0.01) || (FlCheck < -0.01))
                    {
                        IgnInt = ((IgnFl * 25) / 9) + 15;
                        BinObj[i] = IgnInt;
                    }
                    else
                        BinObj[i] = IgnOrgArr[k][l];
                    i++;
                }
            }
        }
        else if (FuelMapAdr == i)
        {
            for(k=0;k<17;k++)
            {
                for(l=0;l<15;l++)
                {
                    sprintf(FuelStr,"%s",Form1->StringGrid2->Cells[l+1][k+1]);
                    FuelFl = atof(FuelStr);
                    FlCheck = FuelMapArr[k][l]-FuelFl;
                    if ((FlCheck > 0.01) || (FlCheck < -0.01))
                    {
                        FuelInt = (FuelFl * FuelMult[0][l]) - FuelMult[1][l];
                        BinObj[i] = FuelInt;
                    }
                    else
                        BinObj[i] = FuelOrgArr[k][l];
                    i++;
                }
            }
        }
    }

    UpdateChecksum();


    for(i=0;i<FileLen;i++)
        fputc(BinObj[i],NewBinFile);
    fclose(NewBinFile);
}


void ExportMap(char *Mapfile)
{
    FILE    *exp;
    int i,j;

    exp = fopen(Mapfile,"wb+");
    if (!(exp))
        return;

    for(i=0;i<17;i++)
        for(j=0;j<15;j++)
            fputc(IgnOrgArr[i][j],exp);
    for(i=0;i<17;i++)
        for(j=0;j<15;j++)
            fputc(FuelOrgArr[i][j],exp);
    for (i=0;i<15;i++)
        fputc(FuelMultArr[i],exp);

    fclose(exp);
}

void ImportMap(char *Mapfile)
{
    FILE    *imp;
    int i,j;

    imp = fopen(Mapfile,"rb");
    if (!(imp))
        return;

    for(i=0;i<17;i++)
        for(j=0;j<15;j++)
            IgnOrgArr[i][j] = fgetc(imp);
    for(i=0;i<17;i++)
        for(j=0;j<15;j++)
            FuelOrgArr[i][j] = fgetc(imp);
    for (i=0;i<15;i++)
        FuelMultArr[i] = fgetc(imp);

    fclose(imp);

    for(i=0;i<15;i++)
    {
        if (FuelMultArr[i] != 0)
        {
            FuelMult[0][i] = 208.0 / (2 << (FuelMultArr[i]-1));
            FuelMult[1][i] = 224.0 / (2 << (FuelMultArr[i]-1));
        }
        else
        {
            FuelMult[0][i] = 208.0;
            FuelMult[1][i] = 224.0;
        }
    }

    DisplayValues();
}

void UpdateChecksum()
{
    int     i;
    long    ChkSum;
    int     ChkSumX;
    int     ChkSumY;
    int     ChkSumNew;

    if (ModelNum < 2)
    {
        if (BinObj[ChkSumAdr] == 0x60)
            BinObj[ChkSumAdr] = 0x80;
    }
    else
    {
        ChkSum = 0;
        for(i=0;i<ChkArea;i++)
            ChkSum = ChkSum + BinObj[i];
        ChkSumX = ChkSum % 256;
        if (ChkSumX != 0)
        {
            ChkSumY = BinObj[ChkSumMod];
            if (ChkSumX > ChkSumY)
                ChkSumNew = ChkSumY + 256 - ChkSumX;
            else
                ChkSumNew = ChkSumY - ChkSumX;
            BinObj[ChkSumMod] = ChkSumNew;
        }
        ChkSum = 0;
        for(i=0;i<ChkArea;i++)
            ChkSum = ChkSum + BinObj[i];
        ChkSumX = ChkSum % 256;
    }
}

//---------------------------------------------------------------------------

__fastcall TForm1::TForm1(TComponent* Owner)
    : TForm(Owner)
{
    int i;

    for (i=0;i<16;i++)
    {
       Form1->StringGrid1->Cells[i][0] = LnBuf[i];
       Form1->StringGrid2->Cells[i][0] = LnBuf[i];
    }
    for (i=1;i<18;i++)
    {
       Form1->StringGrid1->Cells[0][i] = RpmBuf[i-1];
       Form1->StringGrid2->Cells[0][i] = RpmBuf[i-1];
    }
}
//---------------------------------------------------------------------------

void __fastcall TForm1::OpenFile1Click(TObject *Sender)
{
    char    BinInpFile[255];

    OpenDialog1->DefaultExt = "bin";
    OpenDialog1->FileName = "*.bin";
    OpenDialog1->Execute();
    sprintf(BinInpFile,"%s",OpenDialog1->FileName);
    OpenBinFile(BinInpFile);
}
//---------------------------------------------------------------------------

void __fastcall TForm1::SaveFile1Click(TObject *Sender)
{
    char    BinOutFile[255];

    SaveDialog1->DefaultExt = "bin";
    SaveDialog1->FileName = "*.bin";
    SaveDialog1->Execute();
    sprintf(BinOutFile,"%s",SaveDialog1->FileName);
    WriteNewBin(BinOutFile);
}



void __fastcall TForm1::Export1Click(TObject *Sender)
{
    char    MapOutFile[255];

    SaveDialog1->DefaultExt = "map";
    SaveDialog1->FileName = "*.map";
    SaveDialog1->Execute();
    sprintf(MapOutFile,"%s",SaveDialog1->FileName);
    ExportMap(MapOutFile);
}
//---------------------------------------------------------------------------

void __fastcall TForm1::Import1Click(TObject *Sender)
{
    char    MapInpFile[255];

    OpenDialog1->DefaultExt = "map";
    OpenDialog1->FileName = "*.map";
    OpenDialog1->Execute();
    sprintf(MapInpFile,"%s",OpenDialog1->FileName);
    ImportMap(MapInpFile);
}
//---------------------------------------------------------------------------


void __fastcall TForm1::About1Click(TObject *Sender)
{
    // test
    Form2->ShowModal();
}
//---------------------------------------------------------------------------

