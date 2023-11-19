document.addEventListener('DOMContentLoaded', function() {
    var downloadMinecraft = document.getElementById('download-minecraft');
    var downloadStreaming = document.getElementById('download-streaming');
    
    downloadMinecraft.addEventListener('click', function() {
        var link = document.createElement('a');
        link.href = 'https://www.mediafire.com/file/rcb5gu245pg71s8/Stotteyman%2527s_PvP_Pack_%25231.zip/file';
        link.target = '_blank';
        link.download = 'Stotteyman_PvP_Pack.zip'; // Specify the desired file name
        link.click();
    });

    downloadStreaming.addEventListener('click', function() {
        var link = document.createElement('a');
        link.href = 'https://drive.google.com/drive/folders/1IWigR07d3sYkUVJXgKpHUUIFxfK19YkN?usp=drive_link';
        link.target = '_blank';
        link.click();
    });
});
