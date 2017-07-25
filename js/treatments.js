var renderTreatments = function() {
    firebase.database().ref('treatments')
        .once('value', function(data) {
            var treatments = data.val();
            if (!treatments) { return; }
            var treatmentPanel = $('#treatment_list');
            var outerForm = $('<form>', { class: 'form-horizontal'});
            for (var key in treatments) {
                var info = treatments[key];
                var panel = $('<div>', { class: 'panel panel-primary' });
                var body = $('<div>', { class: 'panel-body' });
                for (var fieldKey in treatmentKeys) {
                    var field = renderField(fieldKey, treatmentKeys[fieldKey], info[fieldKey]);
                    body.append(field);
                }
                var deleteButton = $('<button>', { text: 'Delete',
                                                   class: 'btn btn-danger col-sm-2 col-sm-offset-10'});
                body.append(deleteButton);
                panel.append(body);
                outerForm.append(panel);
            }
            treatmentPanel.append(outerForm);
        });
    var saveButton = $('<button>', { text: 'Save',
                                     class: 'btn btn-success',
                                     id: 'save_treatment_button'});
    saveButton.click(function() {
        saveTreatments();
    });
    var newTreatmentButton = $('<button>', { text: 'New',
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
    var panel = $('#treatment_list');
    var element = $('<div>', { style: 'border-style: solid; '
                               + 'border-width: 2px; border-color: grey;'});
    for (key in treatmentKeys) {
        element.append(renderField(key, treatmentKeys[key], ''));
    }
    panel.append(element);
    var treatmentId = firebase.database().ref('treatments/').push({});
    console.log(treatmentId);
    element.attr('id', treatmentId.key);
};

var saveTreatments = function() {
    var map = {};
    $('#treatment_list').children('div').each(function() {
        var treatmentId = $(this).attr('id');
        var info = {};
        var allInputFields = $(this).find('input').each(
            function() {
                var fieldKey = $(this).attr('id').substring(5);
                var fieldValue = $(this).val();
                info[fieldKey] = fieldValue;
            }
        );
        map[treatmentId] = info;
    });
    firebase.database().ref('treatments/').update(map);
}
