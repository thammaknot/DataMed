var renderPrescriptions = function() {
    firebase.database().ref('prescriptions')
        .once('value', function(data) {
            var prescriptions = data.val();
            if (!prescriptions) { return; }
            var prescriptionPanel = $('#prescription_list');
            var outerForm = $('<form>', { class: 'form-horizontal' });
            for (var key in prescriptions) {
                var info = prescriptions[key];
                var panel = $('<div>', { class: 'panel panel-primary', id: key });
                var body = $('<div>', { class: 'panel-body' });
                for (var fieldKey in prescriptionKeys) {
                    var field = renderField(fieldKey, prescriptionKeys[fieldKey], info[fieldKey]);
                    body.append(field);
                }
                var deleteButton = $('<button>', { text: 'Delete',
                                                   class: 'btn btn-danger col-sm-2 col-sm-offset-10'});
                body.append(deleteButton);
                panel.append(body);
                outerForm.append(panel);
            }
            prescriptionPanel.append(outerForm);
        });
    var saveButton = $('<button>', { text: 'Save',
                                     class: 'btn btn-success',
                                     id: 'save_prescription_button'});
    saveButton.click(function() {
        print('Save button clicked!');
        savePrescriptions();
    });
    var newPrescriptionButton = $('<button>', { text: 'New',
                                                class: 'btn btn-primary',
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
    $('#prescription_list').children('form').children('div').each(function() {
        var prescriptionId = $(this).attr('id');
        var info = {};
        for (var key in prescriptionKeys) {
            var value = $(this).find('#edit_' + key).val();
            if (value) {
                info[key] = value;
            }
        }
        map[prescriptionId] = info;
    });
    firebase.database().ref('prescriptions/').update(map);
}
