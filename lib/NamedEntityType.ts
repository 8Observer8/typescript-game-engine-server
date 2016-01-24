import EntityType from "./EntityType";

export default class NamedEntityType extends EntityType {

	public name:string;

	constructor(name:string) {
		super("named");
		this.name = name;
	}

	protected getInternalData():any {
		return {
			name: this.name
		};
	}

}
