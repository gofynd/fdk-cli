export function customHelpSectionData(entity){
    const temp = entity.helpInformation;
    entity.helpInformation = function (){
        let value = temp.call(this);
        value = value.replace(/(Usage:\s.*?)(\|)(.*?\n)/, '$1 | $3'); // Add space between command aliases
        return value;
    }  
}