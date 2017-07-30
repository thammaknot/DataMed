var renderTreatments = function() {
    firebase.database().ref('treatments')
        .once('value', function(data) {
            var treatments = data.val();
            if (!treatments) { return; }
            var treatmentPanel = $('#treatment_list');
            var outerForm = $('<form>', { class: 'form-horizontal', id: 'treatmentListContainer' });
            for (var key in treatments) {
                var info = treatments[key];
                var panel = renderTreatmentPanel(key, info);
                outerForm.append(panel);
            }
            treatmentPanel.append(outerForm);
        });
    var saveButton = $('<button>', { text: STRINGS.save,
                                     class: 'btn btn-success',
                                     id: 'save_treatment_button'});
    saveButton.click(function() {
        saveTreatments();
    });
    var newTreatmentButton = $('<button>', { text: STRINGS.new_treatment,
                                                class: 'btn btn-primary',
                                                id: 'new_treatment_button'});
    newTreatmentButton.click(function() {
        newTreatment();
    });
    var buttonPanel = $('#treatment_button_panel');
    buttonPanel.append(newTreatmentButton);
    buttonPanel.append(saveButton);
};

var newTreatment = function() {
    var treatmentId = firebase.database().ref('treatments/').push({});
    print(treatmentId);
    var panel = renderTreatmentPanel(treatmentId.key, {});
    $('#treatmentListContainer').append(panel);
};

var renderTreatmentPanel = function(key, info) {
    var panel = $('<div>', { class: 'panel panel-primary', id: key });
    var body = $('<div>', { class: 'panel-body' });
    for (var fieldKey in treatmentKeys) {
        var field = renderField(fieldKey, treatmentKeys[fieldKey], info[fieldKey]);
        body.append(field);
    }
    var deleteButton = $('<button>', { text: STRINGS.delete,
                                       class: 'btn btn-danger col-sm-2 col-sm-offset-10'});
    body.append(deleteButton);
    panel.append(body);
    return panel;
};

var saveTreatments = function() {
    var map = {};
    $('#treatment_list').children('form').children('div').each(function() {
        var treatmentId = $(this).attr('id');
        var info = {};
        for (var key in treatmentKeys) {
            var value = $(this).find('#edit_' + key).val();
            if (value) {
                info[key] = value;
            }
        }
        map[treatmentId] = info;
    });
    print(map);
    firebase.database().ref('treatments/').update(map);
}
