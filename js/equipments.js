var EQUIPMENT_FIREBASE_PATH = 'equipments/';

var renderEquipments = function() {
    firebase.database().ref(EQUIPMENT_FIREBASE_PATH)
        .once('value', function(data) {
            var equipments = data.val();
            if (!equipments) { return; }
            var equipmentPanel = $('#equipment_list');
            var outerForm = $('<form>', { class: 'form-horizontal', id: 'equipmentListContainer' });
            for (var key in equipments) {
                var info = equipments[key];
                var panel = renderEquipmentPanel(key, info);
                outerForm.append(panel);
            }
            equipmentPanel.append(outerForm);
        });
    var saveButton = $('<button>', { class: 'btn btn-success',
                                     id: 'save_equipment_button'});
    saveButton.append(getGlyph('floppy-disk'));
    saveButton.append(' ' + STRINGS.save);
    saveButton.click(function() {
        saveEquipments();
    });
    var newEquipmentButton = $('<button>', { class: 'btn btn-primary',
                                             id: 'new_equipment_button'});
    newEquipmentButton.append(getGlyph('plus'));
    newEquipmentButton.append(' ' + STRINGS.new_equipment);
    newEquipmentButton.click(function() {
        newEquipment();
    });
    var buttonPanel = $('#equipment_button_panel');
    buttonPanel.append(newEquipmentButton);
    buttonPanel.append(saveButton);
};

var newEquipment = function() {
    var equipmentId = firebase.database().ref(EQUIPMENT_FIREBASE_PATH).push({});
    print(equipmentId);
    var panel = renderEquipmentPanel(equipmentId.key, {});
    $('#equipmentListContainer').append(panel);
};

var renderEquipmentPanel = function(key, info) {
    var panel = $('<div>', { class: 'panel panel-primary', id: key });
    var body = $('<div>', { class: 'panel-body' });
    for (var fieldKey in equipmentKeys) {
        var field = renderField(fieldKey, equipmentKeys[fieldKey], info[fieldKey]);
        body.append(field);
    }
    var deleteButton = $('<button>', { class: 'btn btn-danger col-sm-2 col-sm-offset-10'});
    deleteButton.append(getGlyph('trash'));
    deleteButton.append(' ' + STRINGS.delete);
    deleteButton.click(function() {
        firebase.database().ref(EQUIPMENT_FIREBASE_PATH + key).remove(onUpdateComplete);
    });
    body.append(deleteButton);
    panel.append(body);
    return panel;
};

var saveEquipments = function() {
    var map = {};
    $('#equipment_list').children('form').children('div').each(function() {
        var equipmentId = $(this).attr('id');
        var info = {};
        for (var key in equipmentKeys) {
            var value = $(this).find('#edit_' + key).val();
            if (value) {
                info[key] = value;
            }
        }
        map[equipmentId] = info;
    });
    firebase.database().ref(EQUIPMENT_FIREBASE_PATH).update(map, onUpdateComplete);
}
