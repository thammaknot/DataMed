var renderAllTemplates = function() {
    firebase.database().ref('images/templates/')
        .on('value', function(data) {
            var images = data.val();
            if (!images) { return; }
            var storage = firebase.storage();
            var imageListDiv = $('#image_list');
            imageListDiv.empty();
            for (var key in images) {
                var url = images[key].url;
                var name = images[key].name;
                var panel = renderImagePanel(key, name, url);
                imageListDiv.append(panel);
            }
        });
    var newImageButton = $('<button>', { class: 'btn btn-primary',
                                         id: 'new_image_button'});
    newImageButton.append(getGlyph('plus'));
    newImageButton.append(' ' + STRINGS.new_image);
    newImageButton.click(function() {
        var panel = renderNewImagePanel();
        $('#image_list').append(panel);
    });
    var buttonPanel = $('#image_button_panel');
    buttonPanel.append(newImageButton);
};

var readAndDisplayImage = function(input, imageElementId) {
    var reader = new FileReader();

    reader.onload = function (e) {
        $('#' + imageElementId).attr('src', e.target.result);
    }

    reader.readAsDataURL(input.files[0]);
};

var renderNewImagePanel = function() {
    var panel = $('<div>', { class: 'panel panel-info', id: 'new_image_panel' });
    var header = $('<div>', { class: 'panel-heading' }).text(STRINGS.new_image_title);
    var body = $('<div>', { class: 'panel-body' });
    var nameLabel = $('<label>').text('ชื่อภาพ*');
    var nameField = $('<input>', { class: 'form-control', id: 'image_name_field' });
    var uploadWrapper = $('<label>', { class: 'btn btn-primary btn-file' });
    var uploadField = $('<input>', { style: 'display: none;', type: 'file', id: 'new_image_file' });
    var uploadLabel = $('<label>', { id: 'upload_file_label' });
    var newImagePreview = $('<img>', { style: 'display: none;', id: 'new_image_preview' });
    var saveButton = $('<button>', { class: 'btn btn-success' });
    uploadField.change(function (e) {
        var filename = $(this).val().split('\\').pop();
        uploadLabel.text(filename);
        readAndDisplayImage(this, 'new_image_preview');
        $('#new_image_preview').attr({ style: 'display: block;' }).width(250);
    });
    saveButton.append(getGlyph('floppy-disk'));
    saveButton.append(' ' + STRINGS.save);
    saveButton.click(function() {
        saveImage();
    });
    uploadWrapper.append(STRINGS.browse_file, uploadField);
    body.append(nameLabel, nameField, uploadWrapper, uploadLabel, newImagePreview, saveButton);
    panel.append(header, body);
    return panel;
};

var saveImage = function() {
    var files = document.getElementById('new_image_file').files;
    if (files.length != 1) {
        alert(STRINGS.please_select_image_file);
        return;
    }
    var imageName = $('#image_name_field').val();
    if (!imageName) {
        alert(STRINGS.please_enter_image_name);
        return;
    }
    var file = files[0];
    var filename = file.name;
    var tokens = filename.split('.');
    var basename = tokens[0];
    var extension = tokens[1];
    var filenameWithTimestamp = basename + '_' + Date.now() + (extension ? '.' + extension : '');
    var storage = firebase.storage().ref('images/templates/' + filenameWithTimestamp);
    storage.put(file).then(function(snapshot) {
        var imageInfo = {
            filename: filename,
            name: imageName,
            url: snapshot.downloadURL,
        };
        firebase.database().ref('images/templates/').push(imageInfo, onUpdateComplete);
    });
};

var renderImagePanel = function(key, name, url) {
    var panel = $('<div>', { class: 'panel panel-primary' });
    var header = $('<div>', { class: 'panel-heading' }).text(name);
    var body = $('<div>', { class: 'panel-body' });
    var img = $('<img>', { class: 'img-rounded', src: url });
    img.width(400);
    var deleteButton = $('<button>', { class: 'btn btn-danger' });
    deleteButton.append(getGlyph('remove'));
    deleteButton.append(' ' + STRINGS.delete);
    deleteButton.click(function() {
        var ok = confirm(STRINGS.remove_image);
        if (!ok) { return; }
        removeImage(key);
    });
    body.append(img);
    body.append(deleteButton);
    panel.append(header, body);
    return panel;
};

var removeImage = function(key) {
    firebase.database().ref('images/templates/' + key).remove(onDeletionComplete);
};
