var displayFullVisit = function(queueKey, info) {
    var mainPanel = $('#main');
    mainPanel.empty();

    var patientDiv = $('<div>',
                       { style: 'border-width: 3px;' +
                         'border-style: solid; border-color: blue;' +
                         'width: 450px; '});
    var patient = info.patient;
    for (var key in patientKeys) {
        var label = $('<p>', { text: patientKeys[key].display,
                               style: 'display: inline-block; margin-right: 10px;'});
        var value = $('<p>', { text: patient[key],
                               style: 'display: inline-block' });
        var subDiv = $('<div>');
        subDiv.append(label);
        subDiv.append(value);
        patientDiv.append(subDiv);
    }

    var visitDiv = $('<div>',
                     { style: 'border-width: 3px;' +
                       'border-style: solid; border-color: green; margin: 10px;' +
                       'width: 450px;' });
    var visit = info.visit;
    console.log(visit);
    for (var key in visitKeys) {
        var label = $('<p>', { text: visitKeys[key].display,
                               style: 'display: inline-block; margin-right: 10px;'});
        var value = renderFieldValue(key, visitKeys[key], visit[key]);
        var subDiv = $('<div>');
        subDiv.append(label);
        subDiv.append(value);
        visitDiv.append(subDiv);
    }
    mainPanel.append(patientDiv);
    mainPanel.append(visitDiv);
    var doneButton = $('<button>', { text: 'Finish' });
    doneButton.click(function() {
        dequeue(queueKey);
    });
    var updateButton = $('<button>', { text: 'Update' });
    updateButton.click(function() {
        updateVisit(info.patientId, info.visitId, queueKey);
    });
    mainPanel.append(doneButton);
    mainPanel.append(updateButton);
};

var renderField = function(fieldKey, fieldInfo, value) {
    var outputDiv = $('<div>');
    outputDiv.append(renderFieldLabel(fieldKey, fieldInfo));
    console.log('At this point value is ' + value);
    outputDiv.append(renderFieldValue(fieldKey, fieldInfo, value));
    return outputDiv;
};

var renderFieldLabel = function(fieldKey, fieldInfo, value) {
    var label = $('<p>', { text: fieldInfo.display,
                           style: 'display: inline-block; margin-right: 10px;' });
    return label;
};

var renderFieldValue = function(fieldKey, fieldInfo, value) {
    var type = fieldInfo.type;

    var element;
    var editable = true;
    if (fieldInfo.editable === false) {
        editable = false;
    }
    if (type == 'text' || type == 'short_text') {
        if (!editable) {
            element = $('<label>', { id: 'edit_' + fieldKey,
                                     text: value});
        } else {
            if (type == 'text') {
                element = $('<textarea>', { id: 'edit_' + fieldKey,
                                            text: value,
                                            rows: 5,
                                            cols: 30});
            } else {
                element = $('<input>', { id: 'edit_' + fieldKey,
                                         value: value });
            }
        }
    } else if (type == 'number') {
        element = $('<input>', { id: 'edit_' + fieldKey,
                                 value: value,
                                 size: 6,
                                 disabled: !editable });
    } else if (type == 'date') {
        element = $('<input>', { id: 'edit_' + fieldKey,
                                 disabled: !editable });
        element.datepicker({ dateFormat: 'dd/mm/yy' });
    }
    return element;
};


var dequeue = function(queueKey) {
    var mainPanel = $('#main');
    mainPanel.empty();
    firebase.database().ref('queue/' + queueKey).remove();
};
