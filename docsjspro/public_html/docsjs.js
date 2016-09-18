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
    this.fib;
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
        this.fib = this.getFib(end);
    }
    console.log(this);

};

Doc2003.prototype.getFib = function (end) {
    var fib = {};
    fib.fibBase = getFibBase(end);
    fib.csw = end.u16();
    fib.fibRgW = getFibRgW(end);
    fib.cslw = end.u16();
    fib.fibRgLw = getFibRgLw(end);
    fib.cbRgFcLcb = end.u16();
    fib.fibRgFcLcbBlob = getFibRgFcLcbBlob(end, fib.fibBase.nFib);
    return fib;

    function getFibBase(end) {
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
        end.bp += 12;
        return fb;
    }

    function getFibRgW(end) {
        end.bp += 26;
        var obj = {};
        obj.lidFE = end.u16();
        return obj;
    }
    ;

    function getFibRgLw(end) {
        var obj = {};
        obj.cbMac = end.u32();
        end.bp += 8;
        obj.ccpText = end.u32();
        obj.ccpFtn = end.u32();
        obj.ccpHdd = end.u32();
        end.bp += 4;
        obj.ccpAtn = end.u32();
        obj.ccpEdn = end.u32();
        obj.ccpTxbx = end.u32();
        obj.ccpHdrTxbx = end.u32();
        end.bp += 44;
        return obj;
    }
    ;

    function getFibRgFcLcbBlob(end, nFib) {
        switch (nFib) {
            case 0x00C1:
                return getFibRgFcLcb97(end);
            case 0x00D9:
                return getFibRgFcLcb2000(end);
            case 0x0101:
                return getFibRgFcLcb2002(end);
            case 0x010C:
                return getFibRgFcLcb2003(end);
            case 0x0112:
                return getFibRgFcLcb2007(end);
        }
        return {};
    };

    function getFibRgFcLcb97(end) {
        var obj = {};
        
        obj.fcStshfOrig = end.u32();
        obj.lcbStshfOrig = end.u32();
        obj.fcStshf = end.u32();
        obj.lcbStshf = end.u32();
        obj.fcPlcffndRef = end.u32();
        obj.lcbPlcffndRef = end.u32();
        obj.fcPlcffndTxt = end.u32();
        obj.lcbPlcffndRef = end.u32();
        obj.fcPlcfandRef = end.u32();
        obj.lcbPlcfandRef = end.u32();
        obj.fcPlcfandTxt = end.u32();
        obj.lcbPlcfandTxt = end.u32();
        obj.fcPlcfSed = end.u32();
        obj.lcbPlcfSed = end.u32();
        obj.fcPlcPad = end.u32();
        obj.lcbPlcPad = end.u32();
        obj.fcPlcfPhe = end.u32();
        obj.lcbPlcfPhe = end.u32();
        obj.fcSttbfGlsy = end.u32();
        obj.lcbSttbfGlsy = end.u32();
        obj.fcPlcfGlsy = end.u32();
        obj.lcbPlcfGlsy = end.u32();
        obj.fcPlcfHdd = end.u32();
        obj.lcbPlcfHdd = end.u32();
        obj.fcPlcfBteChpx = end.u32();
        obj.lcbPlcfBteChpx = end.u32();
        obj.fcPlcfBtePapx = end.u32();
        obj.lcbPlcfBtePapx = end.u32();
        obj.fcPlcfSea = end.u32();
        obj.lcbPlcfSea = end.u32();
        obj.fcSttbfFfn = end.u32();
        obj.lcbSttbfFfn = end.u32();
        obj.fcPlcfFldMom = end.u32();
        obj.lcbPlcfFldMom = end.u32();
        obj.fcPlcfFldHdr = end.u32();
        obj.lcbPlcfFldHdr = end.u32();
        obj.fcPlcfFldFtn = end.u32();
        obj.lcbPlcfFldFtn = end.u32();
        obj.fcPlcfFldAtn = end.u32();
        obj.lcbPlcfFldAtn = end.u32();
        obj.fcPlcfFldMcr = end.u32();
        obj.lcbPlcfFldMcr = end.u32();
        obj.fcSttbfBkmk = end.u32();
        obj.lcbSttbfBkmk = end.u32();
        obj.fcPlcfBkf = end.u32();
        obj.lcbPlcfBkf = end.u32();
        obj.fcPlcfBkl = end.u32();
        obj.lcbPlcfBkl = end.u32();
        obj.fcCmds = end.u32();
        obj.lcbCmds = end.u32();
        obj.fcUnused1 = end.u32();
        obj.lcbUnused1 = end.u32();
        obj.fcSttbfMcr = end.u32();
        obj.lcbSttbfMcr = end.u32();
        obj.fcPrDrvr = end.u32();
        obj.lcbPrDrvr = end.u32();
        obj.fcPrEnvPort = end.u32();
        obj.lcbPrEnvPort = end.u32();
        obj.fcPrEnvLand = end.u32();
        obj.lcbPrEnvLand = end.u32();
        obj.fcWss = end.u32();
        obj.lcbWss = end.u32();
        obj.fcDop = end.u32();
        obj.lcbDop = end.u32();
        obj.fcSttbfAssoc = end.u32();
        obj.lcbSttbfAssoc = end.u32();
        obj.fcClx = end.u32();
        obj.lcbClx = end.u32();
        obj.fcPlcfPgdFtn = end.u32();
        obj.lcbPlcfPgdFtn = end.u32();
        obj.fcAutosaveSource = end.u32();
        obj.lcbAutosaveSource = end.u32();
        obj.fcGrpXstAtnOwners = end.u32();
        obj.lcbGrpXstAtnOwners = end.u32();
        obj.fcSttbfAtnBkmk = end.u32();
        obj.lcbSttbfAtnBkmk = end.u32();
        obj.fcUnused2 = end.u32();
        obj.lcbUnused2 = end.u32();
        obj.fcUnused3 = end.u32();
        obj.lcbUnused3 = end.u32();
        obj.fcPlcSpaMom = end.u32();
        obj.lcbPlcSpaMom = end.u32();
        obj.fcPlcSpaHdr = end.u32();
        obj.lcbPlcSpaHdr = end.u32();
        obj.fcPlcfAtnBkf = end.u32();
        obj.lcbPlcfAtnBkf = end.u32();
        obj.fcPlcfAtnBkl = end.u32();
        obj.lcbPlcfAtnBkl = end.u32();
        obj.fcPms = end.u32();
        obj.lcbPms = end.u32();
        obj.fcFormFldSttbs = end.u32();
        obj.lcbFormFldSttbs = end.u32();
        obj.fcPlcfendRef = end.u32();
        obj.lcbPlcfendRef = end.u32();
        obj.fcPlcfendTxt = end.u32();
        obj.lcbPlcfendTxt = end.u32();
        obj.fcPlcfFldEdn = end.u32();
        obj.lcbPlcfFldEdn = end.u32();
        obj.fcUnused4 = end.u32();
        obj.lcbUnused4 = end.u32();
        obj.fcDggInfo = end.u32();
        obj.lcbDggInfo = end.u32();
        obj.fcSttbfRMark = end.u32();
        obj.lcbSttbfRMark = end.u32();
        obj.fcSttbfCaption = end.u32();
        obj.lcbSttbfCaption = end.u32();
        obj.fcSttbfAutoCaption = end.u32();
        obj.lcbSttbfAutoCaption = end.u32();
        obj.fcPlcfWkb = end.u32();
        obj.lcbPlcfWkb = end.u32();
        obj.fcPlcfSpl = end.u32();
        obj.lcbPlcfSpl = end.u32();
        obj.fcPlcftxbxTxt = end.u32();
        obj.lcbPlcftxbxTxt = end.u32();
        obj.fcPlcfFldTxbx = end.u32();
        obj.lcbPlcfFldTxbx = end.u32();
        obj.fcPlcfHdrtxbxTxt = end.u32();
        obj.lcbPlcfHdrtxbxTxt = end.u32();
        obj.fcPlcffldHdrTxbx = end.u32();
        obj.lcbPlcffldHdrTxbx = end.u32();
        obj.fcStwUser = end.u32();
        obj.lcbStwUser = end.u32();
        obj.fcSttbTtmbd = end.u32();
        obj.lcbSttbTtmbd = end.u32();
        obj.fcCookieData = end.u32();
        obj.lcbCookieData = end.u32();
        obj.fcPgdMotherOldOld = end.u32();
        obj.lcbPgdMotherOldOld = end.u32();
        obj.fcBkdMotherOldOld = end.u32();
        obj.lcbBkdMotherOldOld = end.u32();
        obj.fcPgdFtnOldOld = end.u32();
        obj.lcbPgdFtnOldOld = end.u32();
        obj.fcBkdFtnOldOld = end.u32();
        obj.lcbBkdFtnOldOld = end.u32();
        obj.fcPgdEdnOldOld = end.u32();
        obj.lcbPgdEdnOldOld = end.u32();
        obj.fcBkdEdnOldOld = end.u32();
        obj.lcbBkdEdnOldOld = end.u32();
        obj.fcSttbfIntlFld = end.u32();
        obj.lcbSttbfIntlFld = end.u32();
        obj.fcRouteSlip = end.u32();
        obj.lcbRouteSlip = end.u32();
        obj.fcSttbSavedBy = end.u32();
        obj.lcbSttbSavedBy = end.u32();
        obj.fcSttbFnm = end.u32();
        obj.lcbSttbFnm = end.u32();
        obj.fcPlfLst = end.u32();
        obj.lcbPlfLst = end.u32();
        obj.fcPlfLfo = end.u32();
        obj.lcbPlfLfo = end.u32();
        obj.fcPlcfTxbxBkd = end.u32();
        obj.lcbPlcfTxbxBkd = end.u32();
        obj.fcPlcfTxbxHdrBkd = end.u32();
        obj.lcbPlcfTxbxHdrBkd = end.u32();
        obj.fcDocUndoWord9 = end.u32();
        obj.lcbDocUndoWord9 = end.u32();
        obj.fcRgbUse = end.u32();
        obj.lcbRgbUse = end.u32();
        obj.fcUsp = end.u32();
        obj.lcbUsp = end.u32();
        obj.fcUskf = end.u32();
        obj.lcbUskf = end.u32();
        obj.fcPlcupcRgbUse = end.u32();
        obj.lcbPlcupcRgbUse = end.u32();
        obj.fcPlcupcUsp = end.u32();
        obj.lcbPlcupcUsp = end.u32();
        obj.fcSttbGlsyStyle = end.u32();
        obj.lcbSttbGlsyStyle = end.u32();
        obj.fcPlgosl = end.u32();
        obj.lcbPlgosl = end.u32();
        obj.fcPlcocx = end.u32();
        obj.lcbPlcocx = end.u32();
        obj.fcPlcfBteLvc = end.u32();
        obj.lcbPlcfBteLvc = end.u32();
        obj.dwLowDateTime = end.u32();
        obj.dwHighDateTime = end.u32();
        obj.fcPlcfLvcPre10 = end.u32();
        obj.lcbPlcfLvcPre10 = end.u32();
        obj.fcPlcfAsumy = end.u32();
        obj.lcbPlcfAsumy = end.u32();
        obj.fcPlcfGram = end.u32();
        obj.lcbPlcfGram = end.u32();
        obj.fcSttbListNames = end.u32();
        obj.lcbSttbListNames = end.u32();
        obj.fcSttbfUssr = end.u32();
        obj.lcbSttbfUssr = end.u32();
        return obj;
    };
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