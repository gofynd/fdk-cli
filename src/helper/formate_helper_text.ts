export function customHelpSectionData(entity){
    const temp = entity.helpInformation;
    entity.helpInformation = function (){
        let value = temp.call(this);
        value = value.replace(/\|/g, ' | '); // Add space between command aliases
        return value;
    }  
}