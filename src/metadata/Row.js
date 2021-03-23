class Row {

    constructor(args){
        this.num_names = 0;
        this.num_values = 0;
        this.args = args;
    }
    
    setName(name) {
        if (this.num_names++ > 0) {
            this.args.name.appendChild(document.createTextNode(" "));
        }
        this.args.name.appendChild(document.createTextNode(name));
    }

    isURL(_string){
        var protocolAndDomainRE = /^(?:\w+:)?\/\/(\S+)$/;

        var localhostDomainRE = /^localhost[\:?\d]*(?:[^\:?\d]\S*)?$/
        var nonLocalhostDomainRE = /^[^\s\.]+\.\S{2,}$/;


        if (typeof _string !== 'string') {
            return false;
        }

        var match = _string.match(protocolAndDomainRE);
        if (!match) {
            return false;
        }

        var everythingAfterProtocol = match[1];
        if (!everythingAfterProtocol) {
            return false;
        }

        if (localhostDomainRE.test(everythingAfterProtocol) ||
            nonLocalhostDomainRE.test(everythingAfterProtocol)) {
                return true;
        }

        return false;
    }

    
    setValue(value) {
        if (this.num_values++ > 0) {
            this.args.value.appendChild(document.createTextNode(", "));
        }

        var txt = document.createTextNode(value);
        if(this.isURL(value)){
            var a = document.createElement('a');  
            a.appendChild(txt);
            a.target = "_blank"
            a.href = value;
            a.className = "link"
            this.args.value.appendChild(a);
        } else {
            this.args.value.appendChild(txt);
        }
    }
}

export {Row}