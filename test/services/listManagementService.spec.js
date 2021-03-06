'use strict';

const sinon = require('sinon');
const expect = require('chai').expect;
const ListManagementService = require('../../lib/services/listManagementService');

const mockToken = 'token';
const mockListId = 'listId';
const mockListItemId = 'listItemId';
const mockListItemStatus = 'active';
const mockAPIResult = { statusCode: 200, body: '' };
const mockAPIFailFailureResult = { statusCode: 400, body: 'Error'};

describe('ListManagementService', () => {
    it('should call corresponding apiClient method', () => {
        //Set up
        const mockListObject = {};
        const mockListItemObject = {};
        const apiStub = {
            post : () => Promise.resolve(mockAPIResult),
            put : () => Promise.resolve(mockAPIResult),
            get : () => Promise.resolve(mockAPIResult),
            delete : () => Promise.resolve(mockAPIResult)
        };
        const spyPost = sinon.spy(apiStub, 'post');
        const spyPut = sinon.spy(apiStub, 'put');
        const spyGet = sinon.spy(apiStub, 'get');
        const spyDelete = sinon.spy(apiStub, 'delete');

        //Test
        const lms = new ListManagementService(apiStub);
        return lms.getListsMetadata(mockToken)
            .then(() => {
                return lms.createList(mockListObject, mockToken);
            })
            .then(() => {
                return lms.getList(mockListId, mockListItemStatus, mockToken);
            })
            .then(() => {
                return lms.updateList(mockListId, mockListObject, mockToken);
            })
            .then(() => {
                return lms.deleteList(mockListId, mockToken);
            })
            .then(() => {
                return lms.createListItem(mockListId, mockListItemObject, mockToken);
            })
            .then(() => {
                return lms.getListItem(mockListId, mockListItemId, mockToken);
            })
            .then(() => {
                return lms.updateListItem(mockListId, mockListItemId, mockListItemObject, mockToken);
            })
            .then(() => {
                return lms.deleteListItem(mockListId, mockListItemId, mockToken);
            })
            .then(() => {
                expect(spyPost.callCount).to.equal(2);
                expect(spyPut.callCount).to.equal(2);
                expect(spyGet.callCount).to.equal(3);
                expect(spyDelete.callCount).to.equal(2);
            });
    });

    it('should preperly set API Endpoint address with given value', () => {
        //Expect
        const defaultApiEndpoint = 'https://api.amazonalexa.com';
        const updatedApiEndpoint = 'https://dummy.com';

        //Test
        const lms = new ListManagementService();
        expect(lms.getApiEndpoint()).to.equal(defaultApiEndpoint);
        lms.setApiEndpoint(updatedApiEndpoint);
        expect(lms.getApiEndpoint()).to.equal(updatedApiEndpoint);
    });

    it('should properly construct uri and headers with given non empty query parameters', () => {
        //Set up

        const apiStub = {
            get : () => Promise.resolve(mockAPIResult)
        };
        const spyGet = sinon.spy(apiStub, 'get');

        //Expect
        const expectedUri = 'https://api.amazonalexa.com/v2/householdlists/';
        const expectedHeaders = {'Authorization' : `Bearer ${mockToken}`};

        //Test
        const lms = new ListManagementService(apiStub);
        return lms.getListsMetadata(mockToken)
            .then(() => {
                expect(spyGet.getCall(0).args[0]).to.equal(expectedUri);
                expect(spyGet.getCall(0).args[1]).to.deep.equal(expectedHeaders);
            });
    });

    it('should reject promise on http request error', () => {
        //Set up
        const apiStub = {
            get : () => Promise.reject(new Error('Error'))
        };

        //Expect
        const expectedErrMsg = 'Error';

        //Test
        const lms = new ListManagementService(apiStub);
        return lms.getListsMetadata(mockToken)
            .then(() => {
                expect.fail('should have thrown error');
            })
            .catch((error) => {
                expect(error.message).to.equal(expectedErrMsg);
            });
    });

    it('should reject promise with error message if the device API returns a non 2xx status', () => {
        //Set up
        const apiStub = {

            get : () => Promise.resolve(mockAPIFailFailureResult)

        };

        //Expect
        const expectedErrMsg = JSON.stringify('Error');

        //Test
        const lms = new ListManagementService(apiStub);
        return lms.getListsMetadata(mockToken)
            .then(() => {
                expect.fail('should have thrown error');
            })
            .catch((error) => {
                expect(error.statusCode).to.equal(400);
                expect(error.message).to.equal(expectedErrMsg);
            });
    });
});