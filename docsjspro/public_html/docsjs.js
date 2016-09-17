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

function FibRgW97() {
    this.lidFE;
}

function Doc2003() {
    this.minor, this.major, this.bOrder, this.sectShift, this.miniSectShift;
    this.cDirSect, this.cFatSect, this.dirSectStart, this.miniStreamCutoff;
    this.miniFatStart, this.cMiniFatSect, this.difSectStart, this.cDifSect;
    this.fatSects = new Array(109); // [04CH,436] the SECTs of the first 109 FAT sectors
    this.dirs = [];
    this.dirMax = 0;
}


Doc2003.prototype.decode97 = function (end) {
    var wStream = null;
    var table0 = null;
    var table1 = null;
    var objInfo = null;
    for (var i = 0, ii = this.dirs.length; i < ii; i++) {
        var nn = this.dirs[i].name;
        if (nn[0] === 87 && nn[1] === 111 && nn[2] === 114 && nn[3] === 100
                && nn[4] === 68 && nn[5] === 111 && nn[6] === 99 && nn[7] === 117) {
            wStream = this.dirs[i];
        } else if (nn === 49 && nn[1] === 84 && nn[2] === 97 && nn[3] === 98
                && nn[4] === 108 && nn[5] === 101) {
            table1 = this.dirs[i];
        } else if (nn === 48 && nn[1] === 84 && nn[2] === 97 && nn[3] === 98
                && nn[4] === 108 && nn[5] === 101) {
            table0 = this.dirs[i];
        }
    }
    if (wStream) {
        end.bp = wStream.streamOffset;
        var fb = this.getFibBase(end);
        console.log(fb);
    }


};

Doc2003.prototype.getFibBase = function (end) {
    var fb = {};
    fb.wIdent = end.u16();
    fb.nFib = end.u16();
    end.bp += 2;
    fb.lid = end.u16();
    fb.pnNext = end.u16();
    var t = end.u8();
    fb.fDot = t >> 7;
    fb.fGlsy = (t >> 6) & 1;
    fb.fComplex = (t >> 5) & 1;
    fb.fHasPic = (t >> 4) & 1;
    fb.cQuickSaves = t & 15;
    t = end.u8();
    fb.fEncrypted = t >> 7;
    fb.fWhichTblStm = (t >> 6) & 1;
    fb.fReadOnlyRecommended = (t >> 5) & 1;
    fb.fWriteReservation = (t >> 4) & 1;
    fb.fExtChar = (t >> 3) & 1;
    fb.fLocalOverride = (t >> 2) & 1;
    fb.fFarEast = (t >> 1) & 1;
    fb.fObfuscated = t & 1;
    fb.nFibBack = end.u16();
    fb.lKey = end.u32();
    fb.envr = end.u8();
    t = end.u8();
    fb.fMac = t >> 7;
    fb.fEmptySpecial = (t >> 6) & 1;
    fb.fLoadOverridePage = (t >> 5) & 1;
    fb.fSpare0 = t & 7;
    return fb;
};

function DocDir() {
    this.name = new Array(32);
    this.nameLen;
    /**INVALID = 0,STORAGE = 1,STREAM = 2,LOCKBYTES = 3,PROPERTY = 4,ROOT = 5*/
    this.type;
    this.color;
    this.left, this.right, this.child;
    this.CLSID = new Array(16);
    this.stateBits;
    this.startSectLoc;
    this.streamSize;
    this.streamOffset = -1;
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
        d3.cDirSect = end.u32();
        d3.cFatSect = end.u32();
        d3.dirSectStart = end.u32();
        end.bp += 4;
        d3.miniStreamCutoff = end.u32();
        d3.miniFatStart = end.u32();
        d3.cMiniFatSect = end.u32();
        d3.difSectStart = end.u32();
        d3.cDifSect = end.u32();
        for (var i = 0; i < 109; i++) {
            d3.fatSects[i] = end.u32();
        }
        //now reading directory entries
        var off = (d3.dirSectStart << d3.sectShift) + 512;
        end.bp = off;
        while (end.bp < end.len) {
            if ((d3.dirMax + 1) === d3.dirs.length) {
                break;
            }
            var dir = new DocDir();
            for (var i = 0; i < 32; i++) {
                dir.name[i] = end.u16();
            }
            dir.nameLen = String.fromCharCode(end.u16());
            dir.type = end.u8();
            dir.color = end.u8();
            dir.left = end.u32();
            dir.right = end.u32();
            dir.child = end.u32();
            for (var i = 0; i < 16; i++) {
                dir.CLSID[i] = end.u8();
            }
            dir.stateBits = end.u32();
            end.bp += 16;
            dir.startSectLoc = end.u32();
            dir.streamSize = end.u32();
            end.bp += 4;
            d3.dirs.push(dir);
            d3.dirMax = Math.max(Math.max(Math.max(dir.left, dir.right), dir.child), d3.dirMax);
            if (dir.streamSize > 0) {
                if (dir.type === 5) {
                    dir.streamOffset = 512 + (dir.startSectLoc << d3.sectShift);
                } else if (dir.streamSize < d3.miniStreamCutoff) {
                    dir.streamOffset = 512 + (d3.miniFatStart << d3.sectShift) + (dir.startSectLoc << d3.miniSectShift);
                } else {
                    dir.streamOffset = 512 + (dir.startSectLoc << d3.sectShift);
                }
            }
        }
        d3.decode97(end);

    };

    fr.readAsArrayBuffer(ff);
}

//
//function FibBase() {
//    this.wIdent, this.nFib, this.lid, this.pnNext, this.fDot, this.fGlsy;
//    this.fComplex, this.fHasPic, this.cQuickSaves, this.fEncrypted, this.fWhichTblStm;
//    this.fReadOnlyRecommended, this.fWriteReservation, this.fExtChar, this.fLocalOverride;
//    this.fFarEast, this.fObfuscated, this.nFibBack, this.lKey, this.envr, this.fMac;
//    this.fEmptySpecial, this.fLoadOverridePage, this.fSpare0;
//}