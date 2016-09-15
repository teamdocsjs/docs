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
    this.minor, this.major, this.bOrder, this.sectShift, this.miniSectShift;
    this.nDirSect, this.nFatSect, this.dirSectStart, this.miniSectCutoff;
    this.miniFatSectStart, this.nMiniFatSect, this.difSectStart, this.nDifSect;
    this.fatSects = new Array(109); // [04CH,436] the SECTs of the first 109 FAT sectors
    this.dirs = [0];
}

function Directory() {
    this.name = new Array(32);
    this.nameLen;
    /**INVALID = 0,STORAGE = 1,STREAM = 2,LOCKBYTES = 3,PROPERTY = 4,ROOT = 5*/
    this.type;
    this.color;
    this.left, this.right, this.child;
    this.classID = new Array(16);

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
        d3.minor = end.u16();
        d3.major = end.u16();
        d3.bOrder = end.u16();
        d3.sectShift = end.u16();
        d3.miniSectShift = end.u16();
        end.bp += 6;
        d3.nDirSect = end.u32();
        d3.nFatSect = end.u32();
        d3.dirSectStart = end.u32();
        end.bp += 4;
        d3.miniSectCutoff = end.u32();
        d3.miniFatSectStart = end.u32();
        d3.nMiniFatSect = end.u32();
        d3.difSectStart = end.u32();
        d3.nDifSect = end.u32();
        for (var i = 0; i < 109; i++) {
            d3.fatSects[i] = end.u32();
        }
        //now reading directory entries
        var off = (d3.dirSectStart << d3.sectShift) + 512;
        var dir = new Directory(off);
        end.bp = off;
        for (var i = 0; i < 32; i++) {
            dir.name[i] = (String.fromCharCode(end.u16()));
        }
        dir.nameLen = String.fromCharCode(end.u16());
        dir.type = end.u8();
        dir.color = end.u8();
        dir.left = end.u32();
        dir.right = end.u32();
        dir.child = end.u32();
        for (var i = 0; i < 16; i++) {
            dir.classID[i] = end.u8();
        }
//        SECT << ssheader._uSectorShift + 512
        console.log(d3);
        console.log(dir);


    };

    fr.readAsArrayBuffer(ff);
}
