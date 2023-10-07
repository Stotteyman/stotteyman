document.addEventListener('DOMContentLoaded', function() {
    var downloadLink = document.getElementById('download');
    
    downloadLink.addEventListener('click', function() {
        var link = document.createElement('a');
        link.href = 'https://www.mediafire.com/file/rcb5gu245pg71s8/Stotteyman%2527s_PvP_Pack_%25231.zip/file';
        link.target = '_blank';
        link.download = 'Stotteyman_PvP_Pack.zip'; // Specify the desired file name
        link.click();
    });
});
