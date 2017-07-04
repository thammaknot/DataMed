var prescriptionList = {};
var currentVisit = null;

var updateVisit = function(userId, visitId, queueKey) {
    var info = {};
    for (var key in visitKeys) {
        if (key == 'prescriptions') {
            info[key] = getCurrentPrescription();
        } else {
            var value = $('#edit_' + key).val();
            if (value) {
                info[key] = value;
            }
        }
    }
    currentVisit = info;
    firebase.database().ref('visits/' + userId + '/' + visitId + '/').update(info);
    if (queueKey) {
        firebase.database().ref('queue/' + queueKey + '/visit').update(info);
    }
};

var deleteVisit = function(userId, visitId) {
    firebase.database().ref('visits/' + userId + '/' + visitId + '/')
        .update({'deleted' : true});
    $('#new_visit').empty();
};

var renderNewVisit = function(userId, visitId, dateString) {
    var visitsPanel = $('#new_visit');
    visitsPanel.empty();
    var content = '<div>\n<table>\n';
    content += '<tr><td>Date</td><td>' + dateString + '</td></tr>\n';
    for (var key in visitKeys) {
        var keyInfo = visitKeys[key];
        content += '<tr><td>';
        content += keyInfo.display;
        content += '</td><td>';
        content += '<input type="text" id="edit_' + key + '">';
        content += '</td></tr>';
    }
    content += '</table>\n';
    content += '<button onclick="updateVisit(\'' + userId + '\',\'' + visitId + '\');">Update</button>';
    content += '<button onclick="queuePatient(\'' + userId + '\',\'' + visitId + '\');">Queue</button>';
    content += '<button onclick="deleteVisit(\'' + userId + '\',\'' + visitId + '\');">Delete</button>';
    content += '</div>\n';
    visitsPanel.append(content);
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
