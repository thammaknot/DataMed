var validateVisitData = function(key, value) {
    var result = {};
    var testPattern = '';
    var message = '';
    if (key == 'bp') {
        testPattern = '^[1-9][0-9]+/[1-9][0-9]+$';
        var tokens = value.split('/');
        if (tokens.length != 2 ||
            Number(tokens[0]) < Number(tokens[1])) {
            result.error = true;
        }
        message = STRINGS.invalid_bp;
    } else if (key == 'hr') {
        testPattern = '^[1-9][0-9]{1,2}$';
        message = STRINGS.invalid_hr;
    } else if (key == 'weight') {
        testPattern = '^[1-9][0-9]{1,2}$';
        message = STRINGS.invalid_weight;
    } else if (key == 'height') {
        testPattern = '^[1-9][0-9]{1,2}$';
        message = STRINGS.invalid_height;
    } else if (key == 'cost') {
        testPattern = '^[0-9]*$';
        message = STRINGS.invalid_cost;
    } else if (key == 'next_visit') {
        testPattern = '^[0-9][0-9]/[0-9][0-9]/[1-9][0-9]{3,3}$';
        message = STRINGS.invalid_next_visit;
    }
    var regExp = new RegExp(testPattern);
    result.error = result.error || !(regExp.test(value));
    result.message = message;
    return result;
};

var validatePatientData = function(key, value) {
    var result = {};
    var testPattern = '';
    var message = '';
    if (key == 'phone') {
        testPattern = '^[0-9]{3,3}-?[0-9]{3,3}-?[0-9]{3,4}$';
        message = STRINGS.invalid_phone;
    } else if (key == 'dob') {
        testPattern = '^[0-9][1-9]/[0-9][1-9]/[1-9][0-9]{3,3}$';
        message = STRINGS.invalid_key;
    } else if (key == 'email') {
        testPattern = '^[a-z0-9_\.-]{2,}@[a-z0-9_\.-]{2,}\\.[a-z]{2,}$';
        message = STRINGS.invalid_email;
    }
    var regExp = new RegExp(testPattern);
    result.error = result.error || !(regExp.test(value));
    result.message = message;
    return result;
};
