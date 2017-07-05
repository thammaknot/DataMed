var prescriptionList = {};
var currentVisit = null;

var updateVisit = function(userId, visitId, queueKey) {
    if (!visitId) {
        visitId = firebase.database().ref('visits/').push().key;
        currentVisit.id = visitId;
    }
    for (var key in visitKeys) {
        if (key == 'prescriptions') {
            currentVisit[key] = getCurrentPrescription();
        } else {
            var value = $('#edit_' + key).val();
            if (value) {
                currentVisit[key] = value;
            }
        }
    }
    firebase.database().ref('visits/' + userId + '/' + visitId + '/').update(currentVisit);
    if (queueKey) {
        firebase.database().ref('queue/' + queueKey + '/visit').update(currentVisit);
    }
};

var deleteVisit = function(userId, visitId) {
    if (visitId) {
        firebase.database().ref('visits/' + userId + '/' + visitId + '/')
            .update({'deleted' : true});
    }
    $('#new_visit').empty();
};

var renderNewVisit = function(userId, dateString) {
    var visitsPanel = $('#new_visit');
    visitsPanel.empty();
    var containerDiv = $('<div>');
    for (var key in visitKeys) {
        var row = $('<div>');
        var value = '';
        if (key == 'date') {
            value = dateString;
        }
        row.append(renderField(key, visitKeys[key], value));
        containerDiv.append(row);
    }

    var updateButton = $('<button>', { text: 'Update'} );
    var queueButton = $('<button>', { text: 'Queue'} );
    var deleteButton = $('<button>', { text: 'Delete'} );

    updateButton.click(function(curUserId) {
        return function() {
            updateVisit(curUserId, currentVisit.id);
        };
    }(userId));

    queueButton.click(function(curUserId) {
        return function() {
            if (!currentVisit.id) {
                // Need to save it first.
                updateVisit(curUserId, currentVisit.id);
            }
            queuePatient(curUserId, currentVisit.id);
        };
    }(userId));

    deleteButton.click(function(curUserId) {
        return function() {
            deleteVisit(curUserId, currentVisit.id);
        };
    }(userId));

    var buttonRow = $('<div>');
    buttonRow.append(updateButton);
    buttonRow.append(queueButton);
    buttonRow.append(deleteButton);
    containerDiv.append(buttonRow);
    visitsPanel.append(containerDiv);
};

var getCurrentPrescription = function() {
    var prescriptionInfo = {};
    var prescriptionPanel = $('#prescription_panel');
    if (!prescriptionPanel || prescriptionPanel.children().length == 0) {
        return prescriptionInfo;
    }
    $(prescriptionPanel).find('div.prescription_row').each(function() {
        var unitPrice = $(this).find('p.unit_price_value').text();
        var quantity = $(this).find('input.quantity_value').val();
        var medName = $(this).find('select option:selected').text();
        prescriptionInfo[medName] = {
            name: medName,
            unit_price: unitPrice,
            quantity: quantity
        };
    });
    return prescriptionInfo;
};

var loadPrescriptionList = function() {
    firebase.database().ref('prescriptions/')
        .on('value', function(data) {
            var prescriptions = data.val();
            if (!prescriptions) { return; }
            prescriptionList = prescriptions;
        });
};

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

var addNewPrescription = function() {
    var emptyPrescription = renderPrescriptionRow('', null, 0);
    $('#prescription_panel').append(emptyPrescription);
};

var dequeue = function(queueKey) {
    var mainPanel = $('#main');
    mainPanel.empty();
    firebase.database().ref('queue/' + queueKey).remove();
};
