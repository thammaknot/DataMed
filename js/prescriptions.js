var renderPrescriptions = function() {
    firebase.database().ref('prescriptions')
        .once('value', function(data) {
            var prescriptions = data.val();
            if (!prescriptions) { return; }
            var prescriptionPanel = $('#prescription_list');
            var outerForm = $('<form>', { class: 'form-horizontal', id: 'prescriptionListContainer' });
            for (var key in prescriptions) {
                var info = prescriptions[key];
                var panel = renderPrescriptionPanel(key, info);
                outerForm.append(panel);
            }
            prescriptionPanel.append(outerForm);
        });
    var saveButton = $('<button>', { text: STRINGS.save,
                                     class: 'btn btn-success',
                                     id: 'save_prescription_button'});
    saveButton.click(function() {
        savePrescriptions();
    });
    var newPrescriptionButton = $('<button>', { text: STRINGS.new_prescription,
                                                class: 'btn btn-primary',
                                                id: 'new_prescription_button'});
    newPrescriptionButton.click(function() {
        newPrescription();
    });
    var buttonPanel = $('#prescription_button_panel');
    buttonPanel.append(newPrescriptionButton);
    buttonPanel.append(saveButton);
};

var renderPrescriptionPanel = function(key, info) {
    var panel = $('<div>', { class: 'panel panel-primary', id: key });
    var body = $('<div>', { class: 'panel-body' });
    for (var fieldKey in prescriptionKeys) {
        var field = renderField(fieldKey, prescriptionKeys[fieldKey], info[fieldKey]);
        body.append(field);
    }
    var deleteButton = $('<button>', { text: STRINGS.delete,
                                       class: 'btn btn-danger col-sm-2 col-sm-offset-10'});
    body.append(deleteButton);
    panel.append(body);
    return panel;
};

var newPrescription = function() {
    var prescriptionId = firebase.database().ref('prescriptions/').push({});
    print(prescriptionId);
    var panel = renderPrescriptionPanel(prescriptionId.key, {});
    $('#prescriptionListContainer').append(panel);
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
    print('>>>> saving prescription!!!');
    firebase.database().ref('prescriptions/').update(map, onUpdateComplete);
}
