;(function(){
/* Based on https://github.com/agnoster/base32-js/
   MIT licensed. */


// RFC 4648.
var alphabet = 'abcdefghijklmnopqrstuvwxyz234567';

/**
 * Build a lookup table and memoize it
 *
 * Return an object that maps a character to its
 * byte value.
 */

var lookup = function() {
    var table = {}
    // Invert 'alphabet'
    for (var i = 0; i < alphabet.length; i++) {
        table[alphabet[i]] = i
    }
    lookup = function() { return table }
    return table
}

// Base32 decoder.
function Decoder() {
    var skip = 0 // how many bits we have from the previous character
    var byte = 0 // current byte we're producing

    this.output = ''

    // Consume a character from the stream, store
    // the output in this.output. As before, better
    // to use update().
    this.readChar = function(char) {
        if (typeof char != 'string'){
            if (typeof char == 'number') {
                char = String.fromCharCode(char)
            }
        }
        char = char.toLowerCase()
        var val = lookup()[char]
        if (typeof val == 'undefined') {
            // character does not exist in our lookup table
            //return // skip silently. An alternative would be:
            throw Error('Character "' + char + '" is not valid.')
        }
        val <<= 3 // move to the high bits
        byte |= val >>> skip
        skip += 5
        if (skip >= 8) {
            // we have enough to produce output
            this.output += String.fromCharCode(byte)
            skip -= 8
            if (skip > 0) byte = (val << (5 - skip)) & 255
            else byte = 0
        }

    }

    this.finish = function(check) {
        var output = this.output + (skip < 0 ? alphabet[bits >> 3] : '') + (check ? '$' : '')
        this.output = ''
        return output
    }
}

Decoder.prototype.update = function(input, flush, ignore_whitespace) {
    // Ignore whitespace by default.
    if (typeof ignore_whitespace === 'undefined' || ignore_whitespace) {
        input = input.replace(/\s+/g, '');
    }

    for (var i = 0; i < input.length; i++) {
        this.readChar(input[i])
    }
    var output = this.output
    this.output = ''
    if (flush) {
      output += this.finish()
    }
    return output
}

/** Convenience functions
 *
 * These are the ones to use if you just have a string and
 * want to convert it without dealing with streams and whatnot.
 */

// Base32-encoded string goes in, decoded data comes out.
function decode(input) {
    var decoder = new Decoder()
    var output = decoder.update(input, true)
    return output
}

var base32 = {
    Decoder: Decoder,
    decode: decode,
}

if (typeof window !== 'undefined') {
    // we're in a browser - OMG!
    window.base32 = base32
}

if (typeof module !== 'undefined' && module.exports) {
    // nodejs/browserify
    module.exports = base32
}
})();
