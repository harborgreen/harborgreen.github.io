`import DS from 'ember-data'`

StringsTransform = DS.Transform.extend
  deserialize: (serialized) -> serialized
  serialize: (deserialized) -> deserialized

`export default StringsTransform`