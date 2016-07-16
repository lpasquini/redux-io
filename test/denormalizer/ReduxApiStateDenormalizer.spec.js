import chai, { assert } from 'chai';
import shallowDeepEqual from 'chai-shallow-deep-equal';
import { ReduxApiStateDenormalizer } from '../../src/index';
import { createSchemasMap } from '../../src/denormalizer/ReduxApiStateDenormalizer';
import {
  STATUS,
  createStatus,
  updateStatus,
} from '../../src/status';

chai.use(shallowDeepEqual);

function createStorageMap() {
  return {
    type1: 'storage.type1',
    'type2.test': 'storage["type2.test"]',
  };
}

const getStore = () => {
  const store = {
    storage: {
      type1: {
        type1Id1: {
          id: 'type1Id1',
          type: 'type1',
          attributes: {
            name: 'type1Id1',
          },
          relationships: {
            type1: {
              data: [
                {id: 'type1Id2', type: 'type1'},
                {id: 'type1Id3', type: 'type1'},
              ],
            },
            'type2.test': {
              data: {
                id: 'type2Id1', type: 'type2.test',
              },
            },
          },
        },
        type1Id2: {
          id: 'type1Id2',
          type: 'type1',
          attributes: {name: 'type1Id2'},
        },
        type1Id3: {
          id: 'type1Id3',
          type: 'type1',
          attributes: {name: 'type1Id3'},
          relationships: {
            type1: {
              data: [
                {id: 'type1Id2', type: 'type1'},
              ],
            },
          },
        },
      },
      'type2.test': {
        type2Id1: {
          id: 'type2Id1',
          type: 'type2.test',
          attributes: {
            name: 'type2Id1',
          },
        },
      },
    },
  };
  store.storage.type1.type1Id1[STATUS] = createStatus();
  store.storage['type2.test'].type2Id1[STATUS] = createStatus();
  return store;
};

describe('ReduxApiStateDenormalizer', () => {
  describe('new instance', () => {
    it('creates ReduxApiStateDenormalizer instance', () => {
      const denormalizer = new ReduxApiStateDenormalizer();
      assert.isOk(
        denormalizer instanceof ReduxApiStateDenormalizer,
        'denormalizer not instance ReduxApiStateDenormalizer'
      );
    });
  });
  describe('denormalizeItem', () => {
    it('denormalizes valid object relationships data', () => {
      const denormalizer = new ReduxApiStateDenormalizer();
      const expectedData = {
        id: 'type1Id1',
        type: 'type1',
        name: 'type1Id1',
        'type2.test': {
          id: 'type2Id1',
          type: 'type2.test',
          name: 'type2Id1',
        },
        type1: [
          { id: 'type1Id2', type: 'type1', name: 'type1Id2' },
          {
            id: 'type1Id3',
            type: 'type1',
            name: 'type1Id3',
            type1: [{ id: 'type1Id2', type: 'type1', name: 'type1Id2' }],
          },
        ],
      };
      const storage = createSchemasMap(getStore(), createStorageMap());

      const denormalizedData =
        denormalizer.denormalizeItem('type1Id1', 'type1', storage);
      assert.isObject(denormalizedData[STATUS]);
      assert.isObject(denormalizedData['type2.test'][STATUS]);
      assert.shallowDeepEqual(
        denormalizedData,
        expectedData,
        'item not denormalized correctly'
      );
    });
  });
  describe('denormalizeCollection', () => {
    it('denormalizes valid object collection', () => {
      const denormalizer = new ReduxApiStateDenormalizer(getStore, createStorageMap());
      const expectedData = [
        {
          id: 'type1Id1',
          type: 'type1',
          name: 'type1Id1',
          'type2.test': {
            id: 'type2Id1',
            type: 'type2.test',
            name: 'type2Id1',
          },
          type1: [
            { id: 'type1Id2', type: 'type1', name: 'type1Id2' },
            {
              id: 'type1Id3',
              type: 'type1',
              name: 'type1Id3',
              type1: [{ id: 'type1Id2', type: 'type1', name: 'type1Id2' }],
            },
          ],
        },
      ];
      const collection = ['type1Id1'];
      collection[STATUS] = createStatus();
      const denormalizedData =
        denormalizer.denormalizeCollection(collection, 'type1');
      assert.isObject(denormalizedData[STATUS]);
      assert.shallowDeepEqual(
        denormalizedData,
        expectedData,
        'collection not denormalized correctly'
      );
    });
  });
});

