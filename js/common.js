var print = function(s) {
    console.log(s);
};

var renderField = function(fieldKey, fieldInfo, value) {
    var outputDiv = $('<div>', { class: 'form-group row' });
    outputDiv.append(renderFieldLabel(fieldKey, fieldInfo));
    outputDiv.append(renderFieldValue(fieldKey, fieldInfo, value));
    return outputDiv;
};

var renderFieldLabel = function(fieldKey, fieldInfo, value) {
    var label = $('<label>', { class: 'control-label col-sm-3' }).text(fieldInfo.display);
    return label;
};

var renderFieldValue = function(fieldKey, fieldInfo, value) {
    var type = fieldInfo.type;

    var wrapperDiv = $('<div>', {class: 'col-sm-9'});
    var element;
    var elementId = 'edit_' + fieldKey;
    var editable = true;
    if (fieldInfo.editable === false) {
        editable = false;
    }
    if (type == 'text' || type == 'short_text' || type == 'phone'
       || type == 'email') {
        if (!editable) {
            element = $('<label>', { id: elementId,
                                     text: value});
        } else {
            if (type == 'text') {
                element = $('<textarea>', { id: elementId,
                                            text: value,
                                            class: 'form-control',
                                            rows: 5,
                                            cols: 30});
            } else {
                var size = fieldInfo.size;
                element = $('<input>', { id: elementId,
                                         class: 'form-control',
                                         value: value }).attr('size', size);
            }
        }
    } else if (type == 'number') {
        element = $('<input>', { id: elementId,
                                 value: value,
                                 class: 'form-control',
                                 disabled: !editable }).attr('size', 6);
    } else if (type == 'dob') {
        element = $('<input>', { id: elementId,
                                 value: value,
                                 class: 'form-control',
                                 disabled: !editable });
        element.datepicker({ dateFormat: 'dd/mm/yy',
                             changeYear: true,
                             showButtonPanel: true,
                             changeMonth: true,
                             minDate: null,
                             maxDate: '+0d',
                             yearRange: '-100:+0' });
    } else if (type == 'date') {
        element = $('<input>', { id: elementId,
                                 value: value,
                                 class: 'form-control',
                                 disabled: !editable });
        element.datepicker({ dateFormat: 'dd/mm/yy',
                             changeYear: true,
                             showButtonPanel: true,
                             changeMonth: true,
                             minDate: '0d',
                             maxDate: '+1y',
                             yearRange: '-0:+1' });
    } else if (type == 'prescriptions') {
        element = renderPrescriptionValue(value);
    } else if (type == 'treatments') {
        element = renderTreatmentValue(value);
    } else if (type == 'cost') {
        element = renderCostValue(value);
    } else if (type == 'options') {
        element = $('<select>', { id: elementId,
                                  class: 'form-control' });
        for (var option in fieldInfo.options) {
            var optionElement = $('<option>')
                .attr('value',
                      option).text(fieldInfo.options[option].display);
            if (value == option) {
                optionElement.prop('selected', true);
            }
            element.append(optionElement);
        }
    }
    wrapperDiv.append(element);
    return wrapperDiv;
};

var getFieldValue = function(element) {
    var type = element.prev.prop('nodeName');
    var output = '';
    if (type == 'input' || type == 'textarea') {
        output = element.val();
    } else if (type == 'select') {
        output = element.val();
    }
    return output;
};

var renderCostValue = function(value) {
    var div = $('<div>', { class: 'form-group' });
    var costTextField = $('<input>', { value: value,
                                       class: 'form-control',
                                       id: 'edit_cost' });
    var autoCostButton = $('<button>', { class: 'btn btn-success' });
    var autoIconSpan = $('<span>', { class: 'glyphicon glyphicon-flash' });
    autoCostButton.append(autoIconSpan);
    autoCostButton.append(' Auto');
    autoCostButton.click(function() {
        var prescriptionPanel = $('#prescription_panel');
        var treatmentPanel = $('#treatment_panel');
        if ((!prescriptionPanel || prescriptionPanel.children().length == 0)
           && (!treatmentPanel || treatmentPanel.children().length == 0)) {
            alert('Please enter prescription/treatment first!');
            return;
        }
        var totalCost = 0;
        $(prescriptionPanel).find('div.prescription_row').each(function() {
            var unitPrice = $(this).find('label.unit_price_value').text();
            var quantity = $(this).find('input.quantity_value').val();
            totalCost += (Number(unitPrice) * Number(quantity));
        });
        $(treatmentPanel).find('div.treatment_row').each(function() {
            var unitPrice = $(this).find('label.unit_price_value').text();
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
    for (var key in value) {
        var med = value[key];
        var name = med.name;
        var unitPrice = med.unit_price;
        var quantity = med.quantity;
        var row = renderPrescriptionRow(name, unitPrice, quantity);
        div.append(row);
    }
    var wrapperDiv = $('<div>');
    var addButton = $('<button>', { class: 'btn btn-primary' });
    var addIconSpan = $('<span>', { class: 'glyphicon glyphicon-plus' });
    addButton.append(addIconSpan);
    addButton.append(' Add');
    addButton.click(function() {
        addNewPrescription();
    });
    wrapperDiv.append(div);
    wrapperDiv.append(addButton);
    return wrapperDiv;
};

var renderPrescriptionNameAndPriceMenu = function(selectedName, storedUnitPrice) {
    var menu = $('<select>', { class: 'form-control',
                               style: 'margin-right: 10px; display: inline-block;' });
    var priceNameLabel = $('<label>', { text: 'Unit price',
                                        style: 'display: inline-block; margin-right: 10px;'});
    var priceLabel = $('<label>', { style: 'display: inline-block; margin-right: 10px;',
                                    class: 'unit_price_value'});
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
    return div;
};

var renderPrescriptionRow = function(name, unitPrice, quantity) {
    var row = $('<div>', { 'class': 'prescription_row form-group', style: 'display: inline-block;' });
    var prescriptionNameAndPriceDiv =
        renderPrescriptionNameAndPriceMenu(name, unitPrice);
    var quantityTextField = $('<input>', { value: quantity,
                                           'class': 'quantity_value form-control',
                                           style: 'display: inline-block;' }).attr('size', 5);
    var deleteButton = $('<button>', { class: 'btn btn-danger' });
    var deleteIconSpan = $('<span>', { class: 'glyphicon glyphicon-remove' });
    deleteButton.append(deleteIconSpan);
    deleteButton.append(' Delete');
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

// ============================

/**
 * value: {'1': { name: 'treatment1', quantity: 10, unit_price: 12},
 *         '2': { name: 'treatment2', quantity: 20, unit_price: 20}}
 */
var renderTreatmentValue = function(value) {
    var div = $('<div>', { id: 'treatment_panel'});
    for (var key in value) {
        var med = value[key];
        var name = med.name;
        var unitPrice = med.unit_price;
        var quantity = med.quantity;
        var row = renderTreatmentRow(name, unitPrice, quantity);
        div.append(row);
    }
    var wrapperDiv = $('<div>');
    var addButton = $('<button>', { class: 'btn btn-primary' });
    var addIconSpan = $('<span>', { class: 'glyphicon glyphicon-plus' });
    addButton.append(addIconSpan);
    addButton.append(' Add');
    addButton.click(function() {
        addNewTreatment();
    });
    wrapperDiv.append(div);
    wrapperDiv.append(addButton);
    return wrapperDiv;
};

var renderTreatmentNameAndPriceMenu = function(selectedName, storedUnitPrice) {
    var menu = $('<select>', { class: 'form-control',
                               style: 'margin-right: 10px; display: inline-block;' });
    var priceNameLabel = $('<label>', { text: 'Unit price',
                                        style: 'display: inline-block; margin-right: 10px;'});
    var priceLabel = $('<label>', { style: 'display: inline-block; margin-right: 10px;',
                                    class: 'unit_price_value'});
    var unitPrice = -1;
    for (var key in treatmentList) {
        var curMed = treatmentList[key];
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
    return div;
};

var renderTreatmentRow = function(name, unitPrice, quantity) {
    var row = $('<div>', { 'class': 'treatment_row form-group', style: 'display: inline-block;' });
    var treatmentNameAndPriceDiv =
        renderTreatmentNameAndPriceMenu(name, unitPrice);
    var quantityTextField = $('<input>', { value: quantity,
                                           'class': 'quantity_value form-control',
                                           style: 'display: inline-block;' }).attr('size', 5);
    var deleteButton = $('<button>', { class: 'btn btn-danger' });
    var deleteIconSpan = $('<span>', { class: 'glyphicon glyphicon-remove' });
    deleteButton.append(deleteIconSpan);
    deleteButton.append(' Delete');
    deleteButton.click(function(rowToDelete) {
        return function() {
            rowToDelete.remove();
        };
    }(row));
    row.append(treatmentNameAndPriceDiv);
    row.append(quantityTextField);
    row.append(deleteButton);
    return row;
};
