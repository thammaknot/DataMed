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

    var updateButton = $('<button>', { class: 'btn btn-info', type: 'button' });
    var updateIconSpan = $('<span>', { class: 'glyphicon glyphicon-floppy-disk' });
    updateButton.append(updateIconSpan);
    updateButton.append(' Save');
    var queueButton = $('<button>', { class: 'btn btn-primary', type: 'button' });
    var queueIconSpan = $('<span>', { class: 'glyphicon glyphicon-th-list' });
    queueButton.append(queueIconSpan);
    queueButton.append(' Queue');
    var deleteButton = $('<button>', { class: 'btn btn-danger', type: 'button' });
    var deleteIconSpan = $('<span>', { class: 'glyphicon glyphicon-remove' });
    deleteButton.append(deleteIconSpan);
    deleteButton.append(' Delete');

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
    var patientDiv = $('#patient_info_panel');
    patientDiv.empty();
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

    var visitDiv = $('#visit_panel');
    visitDiv.empty();
    visitDiv.append(renderVisitDiv(info.visit, queueKey, info));
};

var renderVisitDiv = function(visitInfo, queueKey, queueInfo) {
    var outputDiv = $('<div>',
                      { style: 'border-width: 3px;' +
                        'border-style: solid; border-color: green; margin: 10px;' +
                        'width: 450px;' });
    var visit = visitInfo;
    currentVisit = visit;
    for (var key in visitKeys) {
        var label = $('<p>', { text: visitKeys[key].display,
                               style: 'display: inline-block; margin-right: 10px;'});
        var value = renderFieldValue(key, visitKeys[key], visit[key]);
        var subDiv = $('<div>');
        subDiv.append(label);
        subDiv.append(value);
        outputDiv.append(subDiv);
    }
    if (queueKey) {
        var doneButton = $('<button>', { text: 'Finish' });
        doneButton.click(function() {
            dequeue(queueKey);
        });
        outputDiv.append(doneButton);
    }
    if (queueInfo && queueKey) {
        var updateButton = $('<button>', { text: 'Update' });
        updateButton.click(function() {
            updateVisit(queueInfo.patientId, queueInfo.visitId, queueKey);
        });
        outputDiv.append(updateButton);
    }
    return outputDiv;
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

var renderVisitOverview = function(visitId, visitInfo) {
    var textContent = visitInfo.date + ' ';
    textContent += visitInfo.symptoms;
    var output = $('<div>', { class: 'panel panel-info'});
    var header = $('<div>', {class: 'panel-heading', text: visitInfo.date});
    var body = $('<div>', {class: 'panel-body', text: visitInfo.symptoms});
    output.append(header);
    output.append(body);
    output.click(function(curVisitInfo) {
        return function() {
            var visitDiv = renderVisitDiv(curVisitInfo);
            $('#visit_panel').empty();
            $('#visit_panel').append(visitDiv);
        };
    }(visitInfo));
    return output;
};

var renderPastVisits = function(userId) {
    firebase.database().ref('visits/' + userId)
        .on('value', function(data) {
            var visits = data.val();
            if (!visits) { return; }
            var pastVisitsPanel = $('#past_visits');
            pastVisitsPanel.empty();
            var pastVisitsContents = $('<div>', {class: 'panel-group'});

            var size = visits.length;
            var i = 1;
            for (var key in visits) {
                var visit = visits[key];
                pastVisitsContents.append(renderVisitOverview(key, visit));
                ++i;
            }
            pastVisitsPanel.append(pastVisitsContents);
        });
};
