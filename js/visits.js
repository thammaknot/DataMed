var prescriptionList = {};
var treatmentList = {};
var currentVisit = null;

var updateVisit = function(userId, visitId, queueKey) {
    if (!visitId) {
        visitId = firebase.database().ref('visits/').push().key;
        currentVisit.id = visitId;
    }
    for (var key in visitKeys) {
        if (key == 'prescriptions' || key == 'treatments') {
            var prefix = (key == 'prescriptions' ? 'prescription' : 'treatment');
            currentVisit[key] = getCurrentPrescriptionOrTreatment(prefix);
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

var getCurrentPrescriptionOrTreatment = function(prefix) {
    var prescriptionInfo = {};
    var prescriptionPanel = $('#' + prefix + '_panel');
    if (!prescriptionPanel || prescriptionPanel.children().length == 0) {
        return prescriptionInfo;
    }
    $(prescriptionPanel).find('div.' + prefix + '_row').each(function() {
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
    firebase.database().ref('treatments/')
        .on('value', function(data) {
            var treatments = data.val();
            if (!treatments) { return; }
            treatmentList = treatments;
        });
};

var displayFullVisit = function(queueKey, info) {
    var mainPanel = $('#main');
    var patientDiv = $('#patient_info_panel');
    patientDiv.empty();
    var patientInfoTable = $('<table>', { class: 'table table-user-information' });
    var patient = info.patient;
    for (var key in patientKeys) {
        var label = $('<td>', { text: patientKeys[key].display });
        var value = $('<td>', { text: patient[key] });
        var subDiv = $('<tr>', { class: 'row' });
        subDiv.append(label);
        subDiv.append(value);
        // patientDiv.append(subDiv);
        patientInfoTable.append(subDiv);
    }
    patientDiv.append(patientInfoTable);

    var visitDiv = $('#visit_panel');
    visitDiv.empty();
    visitDiv.append(renderVisitDiv(info.visit, queueKey, info));
};

var renderVisitDiv = function(visitInfo, queueKey, queueInfo) {
    var outputDiv = $('<div>',
                      { class: 'panel panel-info' });
    var header = $('<div>', { class: 'panel-heading' });
    var headerText = $('<h4>').text('Visit Info');
    header.append(headerText);
    outputDiv.append(header);
    var body = $('<div>', { class: 'panel-body' });
    outputDiv.append(body);
    var visit = visitInfo;
    currentVisit = visit;
    for (var key in visitKeys) {
        var row = $('<div>');
        var value = '';
        row.append(renderField(key, visitKeys[key], visit[key]));
        body.append(row);
    }
    if (queueInfo && queueKey) {
        var updateButton = $('<button>', { class: 'btn btn-primary' });
        var updateIconSpan = $('<span>', { class: 'glyphicon glyphicon-floppy-disk' });
        updateButton.append(updateIconSpan);
        updateButton.append(' Save');
        updateButton.click(function() {
            updateVisit(queueInfo.patientId, queueInfo.visitId, queueKey);
        });
        body.append(updateButton);
    }
    if (queueKey) {
        var doneButton = $('<button>', { class: 'btn btn-success' });
        var doneIconSpan = $('<span>', { class: 'glyphicon glyphicon-check' });
        doneButton.append(doneIconSpan);
        doneButton.append(' Finish');
        doneButton.click(function() {
            dequeue(queueKey);
            addToPostQueue(queueKey, queueInfo);
            $('#visit_panel').empty();
        });
        body.append(doneButton);
    }
    return outputDiv;
};

var addNewPrescription = function() {
    var emptyPrescription = renderPrescriptionRow('', null, 0);
    $('#prescription_panel').append(emptyPrescription);
};

var addNewTreatment = function() {
    var emptyTreatment = renderTreatmentRow('', null, 0);
    $('#treatment_panel').append(emptyTreatment);
};

var addToPostQueue = function(queueKey, queueInfo) {
    firebase.database().ref('treatment-queue/' + queueKey).update(queueInfo);
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
