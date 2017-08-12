var PROCEDURE_TEMPLATE_FIREBASE_PATH = 'procedure-templates/';

var renderProcedures = function() {
    firebase.database().ref(PROCEDURE_TEMPLATE_FIREBASE_PATH)
        .once('value', function(data) {
            var procedures = data.val();
            if (!procedures) { return; }
            var procedurePanel = $('#procedure_list');
            var outerForm = $('<form>', { class: 'form-horizontal', id: 'procedureListContainer' });
            for (var key in procedures) {
                var info = procedures[key];
                var panel = renderProcedurePanel(key, info);
                outerForm.append(panel);
            }
            procedurePanel.append(outerForm);
        });
    var saveButton = $('<button>', { text: STRINGS.save,
                                     class: 'btn btn-success',
                                     id: 'save_procedure_button'});
    saveButton.click(function() {
        saveProcedures();
    });
    var newProcedureButton = $('<button>', { text: STRINGS.new_procedure,
                                                class: 'btn btn-primary',
                                                id: 'new_procedure_button'});
    newProcedureButton.click(function() {
        newProcedure();
    });
    var buttonPanel = $('#procedure_button_panel');
    buttonPanel.append(newProcedureButton);
    buttonPanel.append(saveButton);
};

var newProcedure = function() {
    var procedureId = firebase.database().ref(PROCEDURE_TEMPLATE_FIREBASE_PATH).push({});
    print(procedureId);
    var panel = renderProcedurePanel(procedureId.key, {});
    $('#procedureListContainer').append(panel);
};

var renderProcedurePanel = function(key, info) {
    var panel = $('<div>', { class: 'panel panel-primary', id: key });
    var body = $('<div>', { class: 'panel-body' });
    for (var fieldKey in procedureKeys) {
        var field = renderField(fieldKey, procedureKeys[fieldKey], info[fieldKey]);
        body.append(field);
    }
    var deleteButton = $('<button>', { class: 'btn btn-danger col-sm-2 col-sm-offset-10'});
    deleteButton.append(getGlyph('trash'));
    deleteButton.append(' ' + STRINGS.delete);
    deleteButton.click(function() {
        firebase.database().ref(PROCEDURE_TEMPLATE_FIREBASE_PATH + key).remove(onUpdateComplete);
    });
    body.append(deleteButton);
    panel.append(body);
    return panel;
};

var saveProcedures = function() {
    var map = {};
    $('#procedure_list').children('form').children('div').each(function() {
        var procedureId = $(this).attr('id');
        var info = {};
        for (var key in procedureKeys) {
            var value = $(this).find('#edit_' + key).val();
            if (value) {
                info[key] = value;
            }
        }
        map[procedureId] = info;
    });
    firebase.database().ref(PROCEDURE_TEMPLATE_FIREBASE_PATH).update(map, onUpdateComplete);
}
