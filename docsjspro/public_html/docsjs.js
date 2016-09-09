//[4 bytes] typedef unsigned long ULONG;
//[2 bytes] typedef unsigned short USHORT;
//[2 bytes] typedef short OFFSET;
//[4 bytes] typedef ULONG SECT;
//[4 bytes] typedef ULONG FSINDEX;
//[2 bytes] typedef USHORT FSOFFSET;
//[4 bytes] typedef ULONG DFSIGNATURE;
//[1 byte] typedef unsigned char BYTE;
//[2 bytes] typedef unsigned short WORD;
//[4 bytes] typedef unsigned long DWORD;
//[2 bytes] typedef WORD DFPROPTYPE;
//[4 bytes] typedef ULONG SID;
//[16 bytes] typedef CLSID GUID;
//[8 bytes] typedef struct tagFILETIME {
//DWORD dwLowDateTime;
//DWORD dwHighDateTime;
//} FILETIME, TIME_T;
//[4 bytes] const SECT DIFSECT = 0xFFFFFFFC;
//[4 bytes] const SECT FATSECT = 0xFFFFFFFD;
//[4 bytes] const SECT ENDOFCHAIN = 0xFFFFFFFE;
//[4 bytes] const SECT FREESECT = 0xFFFFFFFF;



function LitEnd(data) {
    this.bp = 0;
    this.arr = data;
    this.len = data.length;
    this.u8 = function () {
        return this.arr[this.bp++];
    };
    this.u16 = function () {
        return this.arr[this.bp++] | this.arr[this.bp++] << 8;
    };
    this.u24 = function () {
        return this.arr[this.bp++] | this.arr[this.bp++] << 8 | this.arr[this.bp++] << 16;
    };
    this.u32 = function () {
        return this.arr[this.bp++] | this.arr[this.bp++] << 8 | this.arr[this.bp++] << 16 | this.arr[this.bp++] << 24;
    };
    this.read = function (inp) {
        for (var i = 0, ii = inp.length; i < ii; i++) {
            inp[i] = this.u8();
        }
    };
}
function BigEnd(data) {
    this.bp = 0;
    this.arr = data;
    this.len = data.length;
    this.u8 = function () {
        return this.arr[this.bp++];
    };
    this.u16 = function () {
        return this.arr[this.bp++] << 8 | this.arr[this.bp++];
    };
    this.u24 = function () {
        return this.arr[this.bp++] << 16 | this.arr[this.bp++] << 8 | this.arr[this.bp++];
    };
    this.u32 = function () {
        return this.arr[this.bp++] << 24 | this.arr[this.bp++] << 16 | this.arr[this.bp++] << 8 | this.arr[this.bp++];
    };
    this.read = function (inp) {
        for (var i = 0, ii = inp.length; i < ii; i++) {
            inp[i] = this.u8();
        }
    };
}

function Doc2003() {
    this._minor, this._major, this._uSectorShift, this._uMiniSectorShift;
    this._csectFat;
    this._sectDirStart;
    this._ulMiniSectorCutoff;
    this._sectMiniFatStart; // [03CH,04] first SECT in the mini-FAT chain
    this._csectMiniFat; // [040H,04] number of SECTs in the mini-FAT chain
    this._sectDifStart; // [044H,04] first SECT in the DIF chain
    this._csectDif; // [048H,04] number of SECTs in the DIF chain
    this._sectFat = new Array(109); // [04CH,436] the SECTs of the first 109 FAT sectors
}

function readFile() {
    var ff = document.getElementById("fileID").files[0];
    var fr = new FileReader();
    fr.onload = function () {
        //starting header
        var data = new Uint8Array(fr.result);
        var end = new LitEnd(data);
        var t = [0, 0, 0, 0, 0, 0, 0, 0];
        end.read(t);
        if (t[0] !== 0xd0 && t[0] !== 0xe0) {
            throw "Invalid DOC File";
        }
        end.bp += 16;
        var d3 = new Doc2003();
        d3._minor = end.u16();
        d3._major = end.u16();
        end.bp += 2;
        d3._uSectorShift = end.u16();
        d3._uMiniSectorShift = end.u16();
        end.bp += 10;
        d3._csectFat = end.u32();
        d3._sectDirStart = end.u32();
        end.bp += 4;
        d3._ulMiniSectorCutoff = end.u32();
        d3._sectMiniFatStart = end.u32();
        d3._csectMiniFat = end.u32();
        d3._sectDifStart = end.u32();
        d3._csectDif = end.u32();
        for (var i = 0; i < 109; i++) {
            d3._sectFat[i] = end.u32();
        }

//        SECT << ssheader._uSectorShift + 512
        console.log(d3);

        console.log(d3._csectFat + " " + d3._sectDirStart + " " + d3._ulMiniSectorCutoff);

    };

    fr.readAsArrayBuffer(ff);
}
