import Entity from "../../Entity";

class EntityProperty {

	public name: string;
	public entityConstructor: (new () => Entity);
	public isEntity: boolean;

	public clientSide: boolean;
	public serverSide: boolean;

	constructor(entityConstructor: any, name: string, clientSide:boolean, serverSide:boolean) {
		this.entityConstructor = entityConstructor;
		this.name = name;
		this.clientSide = clientSide;
		this.serverSide = serverSide;
	}

	toState(object: any): any {
		var value: any;
		if (object instanceof Entity) {
			value = object.getState();
		}
		else if (Array.isArray(object)) {
			value = [];
			object.forEach((e: any) => {
				value.push(this.toState(e));
			});
		}
		else if (object === undefined) {
			value = null;
		}
		else {
			value = object;
		}
		return value;
	}

	getRawValue(entity: Entity): any {
		return (<any> entity)[this.name];
	}

	getStateValue(entity: Entity): any {
		var raw = this.getRawValue(entity);
		// Safety check
		if (!this.isEntity && raw instanceof Entity) {
			throw new Error("An Entity was declared as a standard property!" +
				"You fool! The property is '"+this.name+"' in "+(<any> this.entityConstructor).name)
		}

		return this.toState(raw);
	}

	isSubEntity(): boolean {
		return this.isEntity;
	}
}

class SharedProperty extends EntityProperty {
	constructor(entityConstructor:any, name:string) {
		super(entityConstructor, name, true, true);
		this.isEntity = false; // just to be sure ;)
	}
}

/**
 * Useless?
 */
class ClientOnlyProperty extends EntityProperty {
	constructor(entityConstructor:any, name:string) {
		super(entityConstructor, name, true, false);
	}
}

/**
 * Useless?
 */
class ServerOnlyProperty extends EntityProperty {
	constructor(entityConstructor:any, name:string) {
		super(entityConstructor, name, false, true);
	}
}

/**
 * This kind of property is marked as an entity.
 */
class SharedEntityProperty extends EntityProperty {
	constructor(entityConstructor:any, name:string) {
		super(entityConstructor, name, true, true);
		this.isEntity = true;
	}
}

/**
 * Only applies to properties that are typed as entities.
 * Instead of returning the value itself, returns the GUID of the entity, (or an array of GUIDs).
 */
class EntityReferenceProperty extends SharedEntityProperty {

	constructor(entityConstructor: any, name: string) {
		super(entityConstructor, name);
	}

	/**
	 * When getting a reference, we only retrieve the GUID of the entity.
	 * @param entity
	 * @returns {number|number[]}
	 */
	getValue(entity: Entity): number|number[] {
		var ent: (Entity | Entity[]) = super.getRawValue(entity);
		if (! ent) {
			return null;
		}

		if (Array.isArray(ent)) {
			var result: any[] = [];
			ent.forEach((e: Entity) => {
				result.push(e.getGUID());
			});
			return result;
		}
		if (! (ent instanceof Entity)) {
			throw new Error("Property '"+this.name+"' is not an entity! (got: "+(typeof ent)+")");
		}
		return (<Entity> ent).getGUID();
	}

}

export {
	EntityProperty as BaseClass,
	SharedProperty as Shared,
	ClientOnlyProperty as ClientOnly,
	ServerOnlyProperty as ServerOnly,
	SharedEntityProperty as PropertyEntity,
	EntityReferenceProperty as Reference,
}