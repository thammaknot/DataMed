var ACUPUNCTURE_POINT_FIREBASE_PATH = 'acupuncture_points/';

var renderAcupuncturePoints = function() {
    firebase.database().ref(ACUPUNCTURE_POINT_FIREBASE_PATH)
        .once('value', function(data) {
            var acupuncturePoints = data.val();
            var acupuncturePointPanel = $('#acupuncture_point_list');
            var outerForm = $('<form>', { class: 'form-horizontal', id: 'acupuncturePointListContainer' });
            if (acupuncturePoints) {
                for (var key in acupuncturePoints) {
                    var info = acupuncturePoints[key];
                    var panel = renderAcupuncturePointPanel(key, info);
                    outerForm.append(panel);
                }
            }
            acupuncturePointPanel.append(outerForm);
        });
    var saveButton = $('<button>', { class: 'btn btn-success',
                                     id: 'save_acupuncture_point_button'});
    saveButton.append(getGlyph('floppy-disk'));
    saveButton.append(' ' + STRINGS.save);
    saveButton.click(function() {
        saveAcupuncturePoints();
    });
    var newAcupuncturePointButton = $('<button>', { class: 'btn btn-primary',
                                                    id: 'new_acupuncture_point_button'});
    newAcupuncturePointButton.append(getGlyph('plus'));
    newAcupuncturePointButton.append(' ' + STRINGS.new_acupuncture_point);
    newAcupuncturePointButton.click(function() {
        newAcupuncturePoint();
    });
    var buttonPanel = $('#acupuncture_point_button_panel');
    buttonPanel.append(newAcupuncturePointButton);
    buttonPanel.append(saveButton);
};

var newAcupuncturePoint = function() {
    var acupuncturePointId = firebase.database().ref(ACUPUNCTURE_POINT_FIREBASE_PATH).push({});
    var panel = renderAcupuncturePointPanel(acupuncturePointId.key, {});
    $('#acupuncturePointListContainer').append(panel);
};

var renderAcupuncturePointPanel = function(key, info) {
    var panel = $('<div>', { class: 'panel panel-primary', id: key });
    var body = $('<div>', { class: 'panel-body' });
    for (var fieldKey in acupuncturePointKeys) {
        var field = renderField(fieldKey, acupuncturePointKeys[fieldKey], info[fieldKey]);
        body.append(field);
    }
    var deleteButton = $('<button>', { class: 'btn btn-danger col-sm-2 col-sm-offset-10'});
    deleteButton.append(getGlyph('trash'));
    deleteButton.append(' ' + STRINGS.delete);
    deleteButton.click(function() {
        firebase.database().ref(ACUPUNCTURE_POINT_FIREBASE_PATH + key).remove(onUpdateComplete);
    });
    body.append(deleteButton);
    panel.append(body);
    return panel;
};

var saveAcupuncturePoints = function() {
    var map = {};
    $('#acupuncture_point_list').children('form').children('div').each(function() {
        var acupuncturePointId = $(this).attr('id');
        var info = {};
        for (var key in acupuncturePointKeys) {
            var value = $(this).find('#edit_' + key).val();
            if (value) {
                if (value === 'true' || value === 'false') {
                    value = (value == 'true');
                }
                info[key] = value;
            }
        }
        map[acupuncturePointId] = info;
    });
    firebase.database().ref(ACUPUNCTURE_POINT_FIREBASE_PATH).update(map, onUpdateComplete);
}
