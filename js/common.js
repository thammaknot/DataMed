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
        $.datepicker.setDefaults(
            $.extend(
                {'dateFormat':'dd-mm-yyyy'},
                $.datepicker.regional['th']
            )
        );
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
    } else if (type == 'equipments') {
        element = renderEquipmentValue(value);
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
    } else if (type == 'usage') {
        element = renderDrugUsage(value, elementId);
    } else if (type == 'images') {
        element = renderImagePanel(value, elementId);
    } else if (type == 'procedures') {
        element = renderProcedures(value, elementId);
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
    } else if (type == 'images') {
        print('Getting field value of ' );
        print(element);
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
    autoCostButton.append(' ' + STRINGS.auto_cost);
    autoCostButton.click(function() {
        var prescriptionPanel = $('#prescription_panel');
        var equipmentPanel = $('#equipment_panel');
        var treatmentPanel = $('#treatment_panel');
        var doctorsFeePanel = $('#edit_doctors_fee');
        var totalCost = 0;
        $(prescriptionPanel).find('div.prescription_row').each(function() {
            var unitPrice = $(this).find('label.unit_price_value').text();
            var quantity = $(this).find('input.quantity_value').val();
            totalCost += (Number(unitPrice) * Number(quantity));
        });
        $(equipmentPanel).find('div.equipment_row').each(function() {
            var unitPrice = $(this).find('label.unit_price_value').text();
            var quantity = $(this).find('input.quantity_value').val();
            totalCost += (Number(unitPrice) * Number(quantity));
        });
        $(treatmentPanel).find('div.treatment_row').each(function() {
            var unitPrice = $(this).find('label.unit_price_value').text();
            var quantity = $(this).find('input.quantity_value').val();
            totalCost += (Number(unitPrice) * Number(quantity));
        });
        totalCost += Number(doctorsFeePanel.val());
        $('#edit_cost').val(totalCost);
    });
    div.append(costTextField);
    div.append(autoCostButton);
    return div;
};

/**
 * value: {'1': { name: 'med1', quantity: 10, unit_price: 12, usage: 'abcd'},
 *         '2': { name: 'med2', quantity: 20, unit_price: 20, usage: 'abcd'}}
 */
var renderPrescriptionValue = function(value) {
    var div = $('<div>', { id: 'prescription_panel'});
    for (var key in value) {
        var med = value[key];
        var name = med.name;
        var unitPrice = med.unit_price;
        var quantity = med.quantity;
        var usage = med.usage;
        var row = renderPrescriptionRow(name, unitPrice, quantity, usage);
        div.append(row);
    }
    var wrapperDiv = $('<div>');
    var addButton = $('<button>', { class: 'btn btn-primary' });
    var addIconSpan = $('<span>', { class: 'glyphicon glyphicon-plus' });
    addButton.append(addIconSpan);
    addButton.append(' ' + STRINGS.add_prescription);
    addButton.click(function() {
        addNewPrescription();
    });
    wrapperDiv.append(div);
    wrapperDiv.append(addButton);
    return wrapperDiv;
};

var renderPrescriptionNameAndPriceMenu = function(selectedName, storedUnitPrice) {
    var menu = $('<select>', { class: 'form-control',
                               style: 'margin-right: 10px; display: inline-block;',
                               id: 'prescriptionName' });
    var priceNameLabel = $('<label>', { text: STRINGS.unit_price,
                                        style: 'display: inline-block; margin-right: 10px;'});
    var priceLabel = $('<label>', { style: 'display: inline-block; margin-right: 10px;',
                                    class: 'unit_price_value',
                                    id: 'priceLabel' });
    var unitPrice = -1;
    for (var key in prescriptionList) {
        var curMed = prescriptionList[key];
        var option = $('<option>', { value: key }).text(curMed.name);
        if (curMed.name === selectedName || (unitPrice == -1)) {
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
    div.append(menu);
    div.append(priceNameLabel);
    div.append(priceLabel);
    return div;
};

var renderPrescriptionRow = function(name, unitPrice, quantity, usage) {
    var row = $('<div>', { 'class': 'prescription_row form-group', style: 'display: inline-block;' });
    var prescriptionNameAndPriceDiv =
        renderPrescriptionNameAndPriceMenu(name, unitPrice);
    var quantityTextField = $('<input>', { value: quantity,
                                           class: 'quantity_value form-control col-xs-1',
                                           style: 'display: inline-block;' }).attr('size', 5);
    var usageField = $('<input>', { value: usage,
                                    class: 'form-control usage' });

    var prescriptionSelect = prescriptionNameAndPriceDiv.find('#prescriptionName')[0];
    var prescriptionId = $(prescriptionSelect).find('option:selected')[0].value;
    var defaultValue = prescriptionList[prescriptionId].default_quantity;
    $(prescriptionSelect).change(function() {
        var newPrescriptionId = $(this).find('option:selected')[0].value;
        var priceLabel = $(prescriptionNameAndPriceDiv).find('#priceLabel')[0];
        var unitPrice = prescriptionList[newPrescriptionId].unit_price;
        $(priceLabel).text(unitPrice);

        var newDefaultValue = prescriptionList[newPrescriptionId].default_quantity;
        quantityTextField.attr('value', newDefaultValue);
        var newDefaultUsage = prescriptionList[newPrescriptionId].default_usage;
        usageField.attr('value', newDefaultUsage);
    });
    if (!quantity) {
        quantityTextField.attr('value', defaultValue);
    }
    var defaultUsageValue = prescriptionList[prescriptionId].default_usage;
    if (!usage) {
        usageField.attr('value', defaultUsageValue);
    }
    var deleteButton = $('<button>', { class: 'btn btn-danger' });
    deleteButton.append(getGlyph('remove'));
    deleteButton.append(' ' + STRINGS.delete);
    deleteButton.click(function(rowToDelete) {
        return function() {
            rowToDelete.remove();
        };
    }(row));
    row.append(prescriptionNameAndPriceDiv);
    row.append(quantityTextField);
    row.append(usageField);
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
    addButton.append(' ' + STRINGS.add_treatment);
    addButton.click(function() {
        addNewTreatment();
    });
    wrapperDiv.append(div);
    wrapperDiv.append(addButton);
    return wrapperDiv;
};

var renderTreatmentNameAndPriceMenu = function(selectedName, storedUnitPrice) {
    var menu = $('<select>', { class: 'form-control',
                               style: 'margin-right: 10px; display: inline-block;',
                               id: 'treatmentName' });
    var priceNameLabel = $('<label>', { text: STRINGS.unit_price,
                                        style: 'display: inline-block; margin-right: 10px;'});
    var priceLabel = $('<label>', { style: 'display: inline-block; margin-right: 10px;',
                                    id: 'treatmentPriceLabel',
                                    class: 'unit_price_value'});
    var unitPrice = -1;
    for (var key in treatmentList) {
        var curMed = treatmentList[key];
        var option = $('<option>').attr('value', key).text(curMed.name);
        if (curMed.name === selectedName || (unitPrice == -1)) {
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
                                           class: 'quantity_value form-control',
                                           style: 'display: inline-block;' }).attr('size', 5);

    var treatmentSelect = treatmentNameAndPriceDiv.find('#treatmentName')[0];
    var treatmentId = $(treatmentSelect).find('option:selected')[0].value;
    var defaultValue = treatmentList[treatmentId].default_quantity;
    $(treatmentSelect).change(function() {
        var newTreatmentId = $(this).find('option:selected')[0].value;
        var priceLabel = $(treatmentNameAndPriceDiv).find('#treatmentPriceLabel')[0];
        var unitPrice = treatmentList[newTreatmentId].unit_price;
        $(priceLabel).text(unitPrice);

        print('Treatment change!');
        print('New price is ' + unitPrice);
        print(treatmentList[newTreatmentId]);
        var newDefaultValue = treatmentList[newTreatmentId].default_quantity;
        quantityTextField.attr('value', newDefaultValue);
    });
    if (!quantity) {
        quantityTextField.attr('value', defaultValue);
    }

    var deleteButton = $('<button>', { class: 'btn btn-danger' });
    var deleteIconSpan = $('<span>', { class: 'glyphicon glyphicon-remove' });
    deleteButton.append(deleteIconSpan);
    deleteButton.append(' ' + STRINGS.delete);
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

/**
 * value: {'1': { name: 'equipment1', quantity: 10, unit_price: 12},
 *         '2': { name: 'equipment2', quantity: 20, unit_price: 20}}
 */
var renderEquipmentValue = function(value) {
    var div = $('<div>', { id: 'equipment_panel'});
    for (var key in value) {
        var med = value[key];
        var name = med.name;
        var unitPrice = med.unit_price;
        var quantity = med.quantity;
        var row = renderEquipmentRow(name, unitPrice, quantity);
        div.append(row);
    }
    var wrapperDiv = $('<div>');
    var addButton = $('<button>', { class: 'btn btn-primary' });
    var addIconSpan = $('<span>', { class: 'glyphicon glyphicon-plus' });
    addButton.append(addIconSpan);
    addButton.append(' ' + STRINGS.add_equipment);
    addButton.click(function() {
        addNewEquipment();
    });
    wrapperDiv.append(div);
    wrapperDiv.append(addButton);
    return wrapperDiv;
};

var renderEquipmentNameAndPriceMenu = function(selectedName, storedUnitPrice) {
    var menu = $('<select>', { class: 'form-control',
                               style: 'margin-right: 10px; display: inline-block;',
                               id: 'equipmentName' });
    var priceNameLabel = $('<label>', { text: STRINGS.unit_price,
                                        style: 'display: inline-block; margin-right: 10px;'});
    var priceLabel = $('<label>', { style: 'display: inline-block; margin-right: 10px;',
                                    id: 'equipmentPriceLabel',
                                    class: 'unit_price_value'});
    var unitPrice = -1;
    for (var key in equipmentList) {
        var curEquipment = equipmentList[key];
        var option = $('<option>').attr('value', key).text(curEquipment.name);
        print('EL: ' + key);
        if (curEquipment.name === selectedName || (unitPrice == -1)) {
            option.prop('selected', true);
            unitPrice = curEquipment.unit_price;
        }
        menu.append(option);
    }
    if (storedUnitPrice) {
        unitPrice = storedUnitPrice;
    }
    $(priceLabel).text(unitPrice);
    var div = $('<div>', { style: 'display: inline-block;'} );
    div.append(menu);
    div.append(priceNameLabel);
    div.append(priceLabel);
    return div;
};

var renderEquipmentRow = function(name, unitPrice, quantity) {
    var row = $('<div>', { 'class': 'equipment_row form-group', style: 'display: inline-block;' });
    var equipmentNameAndPriceDiv =
        renderEquipmentNameAndPriceMenu(name, unitPrice);
    var quantityTextField = $('<input>', { value: quantity,
                                           class: 'quantity_value form-control',
                                           style: 'display: inline-block;' }).attr('size', 5);

    var equipmentSelect = equipmentNameAndPriceDiv.find('#equipmentName')[0];
    var equipmentId = $(equipmentSelect).find('option:selected')[0].value;
    var defaultValue = equipmentList[equipmentId].default_quantity;
    $(equipmentSelect).change(function() {
        var newEquipmentId = $(this).find('option:selected')[0].value;
        var priceLabel = $(equipmentNameAndPriceDiv).find('#equipmentPriceLabel')[0];
        var unitPrice = equipmentList[newEquipmentId].unit_price;
        $(priceLabel).text(unitPrice);

        print('Equipment change!');
        print('New price is ' + unitPrice);
        print(equipmentList[newEquipmentId]);
        var newDefaultValue = equipmentList[newEquipmentId].default_quantity;
        quantityTextField.attr('value', newDefaultValue);
    });
    if (!quantity) {
        quantityTextField.attr('value', defaultValue);
    }

    var deleteButton = $('<button>', { class: 'btn btn-danger' });
    var deleteIconSpan = $('<span>', { class: 'glyphicon glyphicon-remove' });
    deleteButton.append(deleteIconSpan);
    deleteButton.append(' ' + STRINGS.delete);
    deleteButton.click(function(rowToDelete) {
        return function() {
            rowToDelete.remove();
        };
    }(row));
    row.append(equipmentNameAndPriceDiv);
    row.append(quantityTextField);
    row.append(deleteButton);
    return row;
};

var renderDrugUsage = function(value, elementId) {
    var outputDiv = $('<div>');
    var textField = $('<input>', { class: 'form-control', id: elementId, value: value });

    var select = $('<select>', { class: 'form-control', id: 'drugUsageSelect' });
    var noneOption = $('<option>', { value: 'none' }).text(STRINGS.select);
    noneOption.prop('selected', true);
    select.append(noneOption);
    for (var i = 0; i < prescriptionUsages.length; ++i) {
        var val = prescriptionUsages[i];
        var option = $('<option>', { value: val }).text(val);
        select.append(option);
    }
    select.change(function() {
        var selectedText = $(this).find('option:selected')[0];
        textField.attr('value', selectedText.value);
    });
    if (value) {
        textField.text(value);
    }
    outputDiv.append(textField);
    outputDiv.append(select);
    return outputDiv;
};

/**
 * value: { 0: { image_id: <id>, drawing: { clickX: [], clickY: [], [], penColors: [], penSizes: [] }},
 *          1: { image_id: ... },
 *          2: { image_id: ... }] }
 */
var renderImagePanel = function(value, elementId) {
    var outputDiv = $('<div>', { id: elementId });
    var addImageButton = $('<button>', { class: 'btn btn-primary' });
    addImageButton.append(getGlyph('picture'), ' ' + STRINGS.add_image);
    outputDiv.append(addImageButton);
    var imageIndex = renderExistingImages(value, outputDiv);
    addImageButton.click(function() {
        var newImageDiv = $('<div>');
        var selectImage = $('<select>', { class: 'form-control' });
        var defaultOption = $('<option>', { value: '', text: STRINGS.select });
        selectImage.append(defaultOption);
        firebase.database().ref('images/templates/')
            .on('value', function(data) {
                var images = data.val();
                if (!images) { return; }
                for (var key in images) {
                    var info = images[key];
                    var option = $('<option>', { value: info.url,
                                                 text: info.name });
                    selectImage.append(option);
                }
            });
        var thumbnailCanvas = $('<canvas>', { id: 'thumb_canvas_' + imageIndex});
        selectImage.change(function(index) {
            return function() {
                var option = $(this).find('option:selected')[0];
                var url = option.value;
                imageInfo[index] = {
                    image_id: index,
                    url: url,
                    drawing: {}
                };
                setupCanvas(thumbnailCanvas, url, imageInfo[index].drawing,
                            thumbnailCanvasWidth, thumbnailCanvasHeight, false);
                thumbnailCanvas.click(function() {
                    showImagePopup(url, index);
                });
            };
        }(imageIndex));
        var deleteButton = $('<button>', { class: 'btn btn-danger' });
        deleteButton.append(getGlyph('remove'), ' ' + STRINGS.delete);
        deleteButton.click(function(index) {
            return function() {
                imageInfo.splice(index, 1);
                newImageDiv.remove();
            };
        }(imageIndex));
        ++imageIndex;
        newImageDiv.append(selectImage, thumbnailCanvas, deleteButton);
        outputDiv.append(newImageDiv);
    });
    return outputDiv;
};

var renderOneImageEntry = function(curImageInfo, index, url) {
    var newImageDiv = $('<div>');
    var selectImage = $('<select>', { id: 'select_image_' + index, class: 'form-control' });
    var defaultOption = $('<option>', { value: '', text: STRINGS.select });
    selectImage.append(defaultOption);
    firebase.database().ref('images/templates/')
        .on('value', function(data) {
            var images = data.val();
            if (!images) { return; }
            for (var key in images) {
                var info = images[key];
                var option = $('<option>', { value: info.url,
                                             text: info.name });
                selectImage.append(option);
            }
        });
    var thumbnailCanvas = $('<canvas>', { id: 'thumb_canvas_' + index});
    if (curImageInfo) {
        $('#select_image_' + index + ' option[value="' + url + '"]').prop('selected', true);
        setupCanvas(thumbnailCanvas, url, curImageInfo.drawing,
                    thumbnailCanvasWidth, thumbnailCanvasHeight, false);
        thumbnailCanvas.click(function() {
            showImagePopup(url, index);
        });
    }
    selectImage.change(function() {
        var option = $(this).find('option:selected')[0];
        var url = option.value;
        imageInfo[index] = {
            image_id: index,
            url: url,
            drawing: {}
        };
        setupCanvas(thumbnailCanvas, url, imageInfo[index].drawing,
                    thumbnailCanvasWidth, thumbnailCanvasHeight, false);
        thumbnailCanvas.unbind('click');
        thumbnailCanvas.click(function() {
            showImagePopup(url, index);
        });
    });
    var deleteButton = $('<button>', { class: 'btn btn-danger' });
    deleteButton.append(getGlyph('remove'), ' ' + STRINGS.delete);
    deleteButton.click(function() {
        imageInfo.splice(index, 1);
        newImageDiv.remove();
    });
    newImageDiv.append(selectImage, thumbnailCanvas, deleteButton);
    return newImageDiv;
};

var renderExistingImages = function(value, parentDiv) {
    var count = 0;
    imageInfo = [];
    for (var id in value) {
        if (!value.hasOwnProperty(id)) {
            continue;
        }
        var image = value[id];
        var newImageDiv = renderOneImageEntry(image, id, image.url);
        imageInfo[count] = image;
        parentDiv.append(newImageDiv);
        ++count;
    }
    return count;
};

// Each entry is
// { id: <key>,
//   url: <url>,
//   drawing: <drawing obj>,
// }
var imageInfo = [];

var showImagePopup = function(url, index) {
    var popup = $('<div>' , { class: 'modal fade' });
    var dialog = $('<div>', { class: 'modal-dialog' });
    var content = $('<div>', { class: 'modal-content' });

    var header = $('<div>', { class: 'modal-header' });
    header.append(STRINGS.image_title);

    var body = $('<div>', { class: 'modal-body' });
    var canvas = $('<canvas>', { id: 'popup_canvas' });

    setupCanvas(canvas, url, imageInfo[index].drawing,
                popupCanvasWidth, popupCanvasHeight, true);
    body.append(canvas);

    dialog.append(content);
    content.append([header, body]);
    popup.append(dialog);
    popup.modal('show');

    // On modal closed.
    popup.on('hidden.bs.modal', function() {
        drawing = getCurrentDrawing();
        imageInfo[index].drawing = drawing;
        imageInfo[index].image_id = index;
        imageInfo[index].url = url;

        // Refresh the thumb image.
        var thumbCanvas = $('#thumb_canvas_' + index);
        setupCanvas(thumbCanvas, url, imageInfo[index].drawing, thumbnailCanvasWidth, thumbnailCanvasHeight, false);
    });
};

var onDeletionComplete = function(error) {
    if (error) {
        $.notify(STRINGS.deletion_failed, { position: 'bottom left',
                                            className: 'error' });
    } else {
        $.notify(STRINGS.deletion_succeeded, { position: 'bottom left',
                                               className: 'success' });
    }
};

var onUpdateComplete = function(error) {
    if (error) {
        $.notify(STRINGS.update_failed, { position: 'bottom left',
                                          className: 'error' });
    } else {
        $.notify(STRINGS.update_succeeded, { position: 'bottom left',
                                             className: 'success' });
    }
};

var onQueuingComplete = function(error, idToEmpty) {
    if (error) {
        $.notify(STRINGS.queuing_failed, { position: 'bottom left',
                                           className: 'error' });
    } else {
        $.notify(STRINGS.queuing_succeeded, { position: 'bottom left',
                                              className: 'success' });
        $('#' + idToEmpty).empty();
    }
};

var getGlyph = function(name) {
    var span = $('<span>', { class: 'glyphicon glyphicon-' + name });
    return span;
};

var setUpQueueNotifications = function() {
    firebase.database().ref('treatment-queue/')
        .on('value', function(data) {
            var length = 0;
            if (data && data.val()) {
                length = Object.keys(data.val()).length;
            }
            if (length == 0) {
                $('#treatment_queue_notification').remove();
            } else {
                var treatmentQueueNotificationBadge = $('#treatment_queue_notification');
                if (treatmentQueueNotificationBadge.length == 0) {
                    treatmentQueueNotificationBadge =
                        $('<span>', { class: 'badge nav-treatment-queue-badge',
                                      id: 'treatment_queue_notification'});
                }
                treatmentQueueNotificationBadge.text(length);
                var navHeader = $('#queue_nav_header');
                var tabHeader = $('#treatment_queue_tab_header');
                if (navHeader) {
                    navHeader.append(treatmentQueueNotificationBadge);
                }
                if (tabHeader) {
                    tabHeader.append(treatmentQueueNotificationBadge);
                }
            }
        });
    firebase.database().ref('payment-queue/')
        .on('value', function(data) {
            var length = 0;
            if (data && data.val()) {
                length = Object.keys(data.val()).length;
            }
            if (length == 0) {
                $('#payment_queue_notification').remove();
            } else {
                var paymentQueueNotificationBadge = $('#payment_queue_notification');
                if (paymentQueueNotificationBadge.length == 0) {
                    paymentQueueNotificationBadge =
                        $('<span>', { class: 'badge nav-payment-queue-badge',
                                      id: 'payment_queue_notification'});
                }
                paymentQueueNotificationBadge.text(length);
                var navHeader = $('#queue_nav_header');
                var tabHeader = $('#payment_queue_tab_header');
                if (navHeader) {
                    navHeader.append(paymentQueueNotificationBadge);
                }
                if (tabHeader) {
                    tabHeader.append(paymentQueueNotificationBadge);
                }
            }
        });
};

var renderProcedures = function(value, elementId) {
    var outputDiv = $('<div>');
    var textArea = $('<textarea>', { id: elementId,
                                     text: value,
                                     class: 'form-control',
                                     rows: 5,
                                     cols: 30 });
    var addTemplateSelect = $('<select>', { class: 'form-control' });
    firebase.database().ref('procedure-templates/')
        .once('value', function(data) {
            var defaultOption = $('<option>', { value: -1, text: STRINGS.select_to_add });
            addTemplateSelect.append(defaultOption);
            var templates = data.val();
            if (!templates) { return; }
            for (var key in templates) {
                var info = templates[key];
                var option = $('<option>', {
                    value: info.text,
                    text: info.name,
                });
                addTemplateSelect.append(option);
            }
            addTemplateSelect.change(function() {
                var selectedText = $(this).find('option:selected')[0].value;
                if (selectedText == -1) { return; }
                var oldText = textArea.val();
                var newText = '';
                if (oldText.length > 0) {
                    newText = oldText + STRINGS.horizontal_divider + selectedText;
                } else {
                    newText = selectedText;
                }
                textArea.val(newText);
                $(this).find('option[value=-1]').prop('selected', true);
            });
        });
    var clearButton = $('<button>', { class: 'btn btn-danger' });
    clearButton.append(getGlyph('erase'));
    clearButton.append(STRINGS.clear);
    clearButton.click(function() {
        textArea.val('');
    });
    outputDiv.append(addTemplateSelect);
    outputDiv.append(clearButton);
    outputDiv.append(textArea);
    return outputDiv;
};
