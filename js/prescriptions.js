var renderPrescriptions = function() {
    firebase.database().ref('prescriptions')
        .once('value', function(data) {
            var prescriptions = data.val();
            if (!prescriptions) { return; }
            var prescriptionPanel = $('#prescription_list');
            for (var key in prescriptions) {
                var info = prescriptions[key];
                var row = $('<div>', { id: key,
                                       style: 'border-style: solid; '
                                       + 'border-width: 2px; border-color: grey;' });
                console.log(info);
                for (var fieldKey in prescriptionKeys) {
                    console.log('FKey: ' + fieldKey + ' | ' + info[fieldKey]);
                    var field = renderField(fieldKey, prescriptionKeys[fieldKey], info[fieldKey]);
                    row.append(field);
                }
                var deleteButton = $('<button>', { text: 'Delete'});
                row.append(deleteButton);
                prescriptionPanel.append(row);
            }
        });
    var saveButton = $('<button>', { text: 'Save',
                                     id: 'save_prescription_button'});
    saveButton.click(function() {
        savePrescriptions();
    });
    var newPrescriptionButton = $('<button>', { text: 'New',
                                                id: 'new_prescription_button'});
    newPrescriptionButton.click(function() {
        newPrescription();
    });
    var buttonPanel = $('#prescription_button_panel');
    buttonPanel.append(newPrescriptionButton);
    buttonPanel.append(saveButton);
};

var newPrescription = function() {
    var panel = $('#prescription_list');
    var element = $('<div>', { style: 'border-style: solid; '
                               + 'border-width: 2px; border-color: grey;'});
    for (key in prescriptionKeys) {
        element.append(renderField(key, prescriptionKeys[key], ''));
    }
    panel.append(element);
    var prescriptionId = firebase.database().ref('prescriptions/').push({});
    console.log(prescriptionId);
    element.attr('id', prescriptionId.key);
};

var savePrescriptions = function() {
    var map = {};
    $('#prescription_list').children('div').each(function() {
        var prescriptionId = $(this).attr('id');
        var info = {};
        var allInputFields = $(this).find('input').each(
            function() {
                var fieldKey = $(this).attr('id').substring(5);
                var fieldValue = $(this).val();
                info[fieldKey] = fieldValue;
            }
        );
        map[prescriptionId] = info;
    });
    firebase.database().ref('prescriptions/').update(map);
}
