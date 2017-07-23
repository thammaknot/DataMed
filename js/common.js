var print = function(s) {
    console.log(s);
};

var renderField = function(fieldKey, fieldInfo, value) {
    var outputDiv = $('<div>', { class: 'form-group' });
    outputDiv.append(renderFieldLabel(fieldKey, fieldInfo));
    outputDiv.append(renderFieldValue(fieldKey, fieldInfo, value));
    return outputDiv;
};

var renderFieldLabel = function(fieldKey, fieldInfo, value) {
    var titleDiv = $('<div>', { class: 'control-label col-sm-2' });
    var h3 = $('<h3>', { text: fieldInfo.display });
    titleDiv.append(h3);
    return titleDiv;
};

var renderFieldValue = function(fieldKey, fieldInfo, value) {
    var type = fieldInfo.type;

    var wrapperDiv = $('<div>', { class: 'col-sm-5'});
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
    } else if (type == 'date') {
        element = $('<input>', { id: elementId,
                                 value: value,
                                 class: 'form-control',
                                 disabled: !editable });
        element.datepicker({ dateFormat: 'dd/mm/yy' });
    } else if (type == 'prescriptions') {
        element = renderPrescriptionValue(value);
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
    for (var key in value) {
        var med = value[key];
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
