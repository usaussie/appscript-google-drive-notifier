/**
 * GET NOTIFICATIONS WHEN FILES ARE DROPPED IN A GOOGLE DRIVE FOLDER
 * 
 * EXAMPLE USAGE
 * 1. Files get dropped into a "needing signature" folder
 * 2. Script runs, which checks for files and if found, sends notifications
 * 3. Email contains link to tell the recipient where to go look
 * 4. Files are moved into a second folder, preventing duplicate notifications from being sent
 *  
 */

/**
 * CHANGE THESE VARIABLES 
 */

// Comma-separated Email addresses of owner and any additional recipients for notification when the audit completes
var NOTIFICATION_RECIPIENTS = "user@domain.com"; // user@domain.com
// Drive folder to look for files first, for notifications to be sent about
var GOOGLE_DRIVE_FOLDER_ID_START = "1QmyQlRk2lDymxIS3uXY2HpNbDg8UKq7f"; // 1QmyQlRk2lDymxIS3uXY2HpNbDg8UKq7f
// Drive folder to move files to after notification is sent
var GOOGLE_DRIVE_FOLDER_ID_FINISH = "xIDg8UKq7fS3uXY21QmyQlRk2lDymHpNb"; // xIDg8UKq7fS3uXY21QmyQlRk2lDymHpNb
// URL to link to in email (might be the same as one of the folders above)
var EMAIL_LINK_URL = "https://drive.google.com/drive/folders/xIDg8UKq7fS3uXY21QmyQlRk2lDymHpNb"; // "https://drive.google.com/drive/folders/xIDg8UKq7fS3uXY21QmyQlRk2lDymHpNb"
// email subject line
var EMAIL_SUBJECT = 'Signature Needed Notification (Google Drive)'; // Signature Needed Notification (Google Drive)

/**
 * DO NOT CHANGE ANYTHING BELOW THIS LINE
 */

/*
* Check for files in the specified folder, then send the notification if things are found
*/
function check_and_notify() {
    
  var start_folder = DriveApp.getFolderById(GOOGLE_DRIVE_FOLDER_ID_START);
  var new_folder = DriveApp.getFolderById(GOOGLE_DRIVE_FOLDER_ID_FINISH);
  
  var file_array = get_file_array_from_google_drive(start_folder);

  for(var i = 0; i < file_array.length; i++) {
  
    var this_file = DriveApp.getFileById(file_array[i].id);
    
    this_file.moveTo(new_folder);
    Logger.log('Moving file to folder: ' + file_array[i].id + ' --> ' + new_folder.getName());

  }
  
  if(file_array.length > 0) {
   
    var templ = HtmlService
      .createTemplateFromFile('email');
  
    templ.folderUrl = EMAIL_LINK_URL;

    templ.fileArray = file_array;
    
    var message = templ.evaluate().getContent();
    
    GmailApp.sendEmail(NOTIFICATION_RECIPIENTS, EMAIL_SUBJECT, simple_plain_text_message(), {
      htmlBody: message
    });

    Logger.log('Sending Email');
    
  }
  
};
/**
 * Get files from specified google drive folder, create array to make things easier when sending the email later
 */
function get_file_array_from_google_drive(folder_object) {
  
  var return_array = [];
  
  var files = folder_object.getFiles();
  
  while (files.hasNext()){
    var file = files.next();
    
    var this_file = {};
    
    this_file.id = file.getId();
    this_file.name = file.getName();
    this_file.url = file.getUrl();

    return_array.push(this_file);

  }

  return return_array;
}

/**
 * Simple plain text message for clients that can't receive HTML
 */
function simple_plain_text_message() {

  return EMAIL_SUBJECT + ': ' + EMAIL_LINK_URL;

}
