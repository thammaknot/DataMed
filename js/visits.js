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
    console.log('!!! Saving...');
    console.log(info);
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
    console.log('### returning pres info:');
    console.log(prescriptionInfo);
    return prescriptionInfo;
};

var loadPrescriptionList = function() {
    firebase.database().ref('prescriptions/')
        .on('value', function(data) {
            var prescriptions = data.val();
            if (!prescriptions) { return; }
            prescriptionList = prescriptions;
            console.log('Prescription: ');
            console.log(prescriptionList);
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
                                 disabled: !editable }).attr('size', 6);
    } else if (type == 'date') {
        element = $('<input>', { id: 'edit_' + fieldKey,
                                 disabled: !editable });
        element.datepicker({ dateFormat: 'dd/mm/yy' });
    } else if (type == 'prescriptions') {
        element = renderPrescriptionValue(value);
    } else if (type == 'cost') {
        element = renderCostValue(value);
    }
    return element;
};

var renderCostValue = function(value) {
    var div = $('<div>');
    var costTextField = $('<input>', { value: value,
                                       id: 'edit_cost' });
    var autoCostButton = $('<button>', { text: 'Auto' });
    autoCostButton.click(function() {
        var prescriptionPanel = $('#prescription_panel');
        if (!prescriptionPanel || prescriptionPanel.children().length == 0) {
            alert('Please enter prescription first!');
            return;
        }
        var totalCost = 0;
        $(prescriptionPanel).find('div.prescription_row').each(function() {
            var unitPrice = $(this).find('p.unit_price_value').text();
            var quantity = $(this).find('input.quantity_value').val();
            totalCost += (Number(unitPrice) * Number(quantity));
        });
        $('#edit_cost').val(totalCost);
    });
    div.append(costTextField);
    div.append(autoCostButton);
    return div;
};

/**
 * value: {'1': { name: 'med1', quantity: 10, unit_price: 12},
 *         '2': { name: 'med2', quantity: 20, unit_price: 20}}
 */
var renderPrescriptionValue = function(value) {
    var div = $('<div>', { id: 'prescription_panel'});
    for (var med in value) {
        var name = med.name;
        var unitPrice = med.unit_price;
        var quantity = med.quantity;
        var row = renderPrescriptionRow(name, unitPrice, quantity);
        div.append(row);
    }
    var wrapperDiv = $('<div>');
    var addButton = $('<button>', { text: 'Add' });
    addButton.click(function() {
        addNewPrescription();
    });
    wrapperDiv.append(div);
    wrapperDiv.append(addButton);
    return wrapperDiv;
};

var renderPrescriptionNameAndPriceMenu = function(selectedName, storedUnitPrice) {
    var menu = $('<select>', { style: 'margin-right: 10px; display: inline-block;' });
    var priceNameLabel = $('<p>', { text: 'Unit price',
                                    style: 'display: inline-block; margin-right: 10px;'});
    var priceLabel = $('<p>', { style: 'display: inline-block; margin-right: 10px;',
                                'class': 'unit_price_value'});
    var unitPrice = -1;
    for (var key in prescriptionList) {
        var curMed = prescriptionList[key];
        var option = $('<option>').attr('value', curMed.unit_price).text(curMed.name);
        if (curMed.name === selectedName || (!selectedName && unitPrice == -1)) {
            option.prop('selected', true);
            unitPrice = curMed.unit_price;
        }
        menu.append(option);
    }
    if (storedUnitPrice) {
        unitPrice = storedUnitPrice;
    }
    $(priceLabel).text(unitPrice);
    var div = $('<div>', { style: 'display: inline-block;'} );
    menu.on('change', function() {
        priceLabel.text(this.value);
    });
    div.append(menu);
    div.append(priceNameLabel);
    div.append(priceLabel);
    console.log('### Returning div ' );
    console.log(div);
    return div;
};

var renderPrescriptionRow = function(name, unitPrice, quantity) {
    var row = $('<div>', { 'class': 'prescription_row', style: 'display: inline-block;' });
    var prescriptionNameAndPriceDiv =
        renderPrescriptionNameAndPriceMenu(name, unitPrice);
    var quantityTextField = $('<input>', { value: quantity,
                                           'class': 'quantity_value',
                                           style: 'display: inline-block;' }).attr('size', 5);
    var deleteButton = $('<button>', { text: 'Delete',
                                       style: 'display: inline-block;' });
    deleteButton.click(function(rowToDelete) {
        return function() {
            rowToDelete.remove();
        };
    }(row));
    row.append(prescriptionNameAndPriceDiv);
    row.append(quantityTextField);
    row.append(deleteButton);
    return row;
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
